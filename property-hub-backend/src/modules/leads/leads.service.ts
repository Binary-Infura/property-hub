import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto, UpdateLeadDto, SendVideoCallLinkDto } from './leads.dto';
import { Lead } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums/role.enum';
import { CallingService } from '../calling/calling.service';
import { ConfigService } from '@nestjs/config';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { MailService } from '../mail/mail.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { OtpService } from '../otp/otp.service';
import axios from 'axios';

@Injectable()
export class LeadsService {
    constructor(
        private prisma: PrismaService,
        private callingService: CallingService,
        private configService: ConfigService,
        private whatsappService: WhatsappService,
        private mailService: MailService,
        private activityLogsService: ActivityLogsService,
        private otpService: OtpService,
    ) { }

    async findAll(user: AuthenticatedUser): Promise<Lead[]> {
        const isCentralAuthority = user.roles.includes(UserRole.CENTRAL_AUTHORITY);
        const isGrowthPartner = user.roles.includes(UserRole.GROWTH_PARTNER);
        const isBuyer = user.roles.includes(UserRole.BUYER);

        let where: any = {};
        if (isCentralAuthority || isGrowthPartner) {
            // Administrative roles see everything by default
            where = {};
        } else if (isBuyer) {
            where.OR = [
                { email: user.email || undefined },
                { phone: user.phone || undefined }
            ];
            // Remove undefined values from OR array
            where.OR = where.OR.filter((item: any) => Object.values(item)[0] !== undefined);
            if (where.OR.length === 0) return [];
        } else if (user.roles.includes(UserRole.PROPERTY_PARTNER)) {
            // Property partners can see all leads to assign them
            where = {};
        } else {
            // Consultants and others only see their assigned leads
            where.assignedTo = user.userId;
        }

        return this.prisma.lead.findMany({
            where,
            include: {
                project: true,
                assignedToUser: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phone: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getCallLogs(user: AuthenticatedUser, leadId?: string, consultantId?: string, projectId?: string) {
        const isCentralAuthority = user.roles.includes(UserRole.CENTRAL_AUTHORITY);

        // 1. Fetch incomplete calls for this user/lead
        // For central authority, they can see everything unless they filter.
        // For others, they only see their own calls.
        const incompleteCalls = await this.prisma.callLog.findMany({
            where: {
                ...(isCentralAuthority ? (consultantId ? { consultantId } : {}) : { consultantId: user.userId }),
                ...(leadId ? { leadId } : {}),
                ...(projectId ? { lead: { projectId } } : {}),
                OR: [{ status: 'queued' }, { status: 'in-progress' }, { status: null }]
            }
        });

        // 2. Sync them with Exotel API
        if (incompleteCalls.length > 0) {
            await Promise.all(incompleteCalls.map(async (call) => {
                if (!call.sid) return;
                try {
                    const details = await this.callingService.syncCallDetails(call.sid);
                    if (details && details.Status !== call.status) {
                        await this.prisma.callLog.update({
                            where: { id: call.id },
                            data: {
                                status: details.Status,
                                recordingUrl: details.RecordingUrl || null,
                                duration: details.Duration ? parseInt(details.Duration) : null,
                                endTime: details.EndTime ? new Date(details.EndTime) : null,
                            }
                        });
                    }
                } catch (error) {
                    // Log error and continue with other calls
                    console.error(`Failed to sync call log ${call.sid}:`, error);
                }
            }));
        }

        // 3. Return the fully synced logs
        return this.prisma.callLog.findMany({
            where: {
                ...(isCentralAuthority ? (consultantId ? { consultantId } : {}) : { consultantId: user.userId }),
                ...(leadId ? { leadId } : {}),
                ...(projectId ? { lead: { projectId } } : {}),
            },
            include: {
                lead: {
                    include: {
                        project: true
                    }
                },
                consultant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, user: AuthenticatedUser): Promise<Lead> {
        const lead = await this.prisma.lead.findUnique({
            where: { id },
            include: {
                project: true,
                visits: true,
            },
        });

        if (!lead) {
            throw new NotFoundException(`Lead with ID ${id} not found`);
        }

        // Authorization check: only central-authority, marketing-manager, and the assigned consultant can access the lead
        const isCentralAuthority = user.roles.includes(UserRole.CENTRAL_AUTHORITY);
        const isGrowthPartner = user.roles.includes(UserRole.GROWTH_PARTNER);
        const isPropertyPartner = user.roles.includes(UserRole.PROPERTY_PARTNER);
        const isAssignedConsultant = lead.assignedTo === user.userId;

        if (!isCentralAuthority && !isGrowthPartner && !isPropertyPartner && !isAssignedConsultant) {
            throw new NotFoundException(`Lead with ID ${id} not found`);
        }

        return lead;
    }

    async create(createLeadDto: CreateLeadDto): Promise<Lead> {
        try {
            const { projectId, campaignId, assignedTo, otp, ...data } = createLeadDto;

            let buyerId: string | undefined;

            // 1. Verify OTP if provided
            if (otp) {
                await this.otpService.verifyOtp({
                    phone: data.phone,
                    email: data.email,
                    code: otp,
                });

                // 2. Auto-signup/Link to User
                // Check if user exists by phone or email
                let user = await this.prisma.user.findFirst({
                    where: {
                        OR: [
                            { phone: data.phone },
                            data.email ? { email: data.email } : null,
                        ].filter(Boolean) as any,
                    },
                });

                if (!user) {
                    // Create new BUYER user
                    user = await this.prisma.user.create({
                        data: {
                            email: data.email || `${data.phone}@propertyhub.com`, // Fallback email
                            phone: data.phone,
                            firstName: data.name.split(' ')[0],
                            lastName: data.name.split(' ').slice(1).join(' ') || '',
                            roles: [UserRole.BUYER],
                            activeRole: UserRole.BUYER,
                            status: 'ACTIVE' as any,
                        },
                    });
                }

                buyerId = user.id;
            }

            // 3. Create Lead
            return await this.prisma.lead.create({
                data: {
                    ...data,
                    project: projectId ? { connect: { id: projectId } } : undefined,
                    campaign: campaignId ? { connect: { id: campaignId } } : undefined,
                    assignedToUser: assignedTo ? { connect: { id: assignedTo } } : undefined,
                    buyer: buyerId ? { connect: { id: buyerId } } : undefined,
                },
                include: {
                    project: true,
                    campaign: true,
                    buyer: true,
                },
            });
        } catch (error) {
            console.error('Error creating lead:', error);
            throw error;
        }
    }

    async createMany(leads: CreateLeadDto[]): Promise<{ count: number }> {
        return this.prisma.lead.createMany({
            data: leads as any,
            skipDuplicates: true,
        });
    }

    async update(id: string, updateLeadDto: UpdateLeadDto, user: AuthenticatedUser): Promise<Lead> {
        const lead = await this.findOne(id, user);
        const { projectId, campaignId, assignedTo, ...data } = updateLeadDto;

        const updatedLead = await this.prisma.lead.update({
            where: { id },
            data: {
                ...data,
                project: projectId ? { connect: { id: projectId } } : undefined,
                campaign: campaignId ? { connect: { id: campaignId } } : undefined,
                assignedToUser: assignedTo ? { connect: { id: assignedTo } } : undefined,
            },
            include: {
                project: true,
                campaign: true,
            },
        });

        // Log status change
        if (updateLeadDto.status && updateLeadDto.status !== lead.status) {
            await this.activityLogsService.log({
                userId: user.userId,
                type: 'LEAD',
                action: 'Status Updated',
                target: updatedLead.name,
                details: { 
                    leadId: updatedLead.id, 
                    previousStatus: lead.status, 
                    newStatus: updatedLead.status 
                }
            });
        }

        return updatedLead;
    }

    async remove(id: string, user: AuthenticatedUser): Promise<Lead> {
        await this.findOne(id, user);

        return this.prisma.lead.delete({
            where: { id },
        });
    }

    async initiateCall(id: string, user: AuthenticatedUser) {
        try {
            // Get the lead without authorization check (check separately for calls)
            const lead = await this.prisma.lead.findUnique({
                where: { id },
                include: {
                    project: true,
                    visits: true,
                },
            });

            if (!lead) {
                console.warn(`Lead not found: ${id}`);
                throw new NotFoundException(`Lead with ID ${id} not found`);
            }

            // Authorization check specific to calls: consultants can call leads assigned to them or unassigned leads
            const isCentralAuthority = user.roles?.includes(UserRole.CENTRAL_AUTHORITY);
            const isGrowthPartner = user.roles?.includes(UserRole.GROWTH_PARTNER);
            const isConsultant = user.roles?.includes(UserRole.CONSULTANT);
            const isAssignedConsultant = lead.assignedTo === user.userId;
            const isUnassignedLead = !lead.assignedTo;

            console.log(`Call authorization check - userId: ${user.userId}, roles: ${user.roles}, lead.assignedTo: ${lead.assignedTo}`);

            // Only allow:
            // 1. Central authority or marketing managers (any lead)
            // 2. Assigned consultant (their assigned lead)
            // 3. Any consultant calling an unassigned lead
            if (!isCentralAuthority && !isGrowthPartner && !(isConsultant && (isAssignedConsultant || isUnassignedLead))) {
                console.warn(`Authorization failed for user ${user.userId} calling lead ${id}`);
                throw new NotFoundException(`Lead with ID ${id} not found`);
            }

            if (!lead.phone) {
                throw new BadRequestException('Lead does not have a phone number');
            }

            // Get consultant phone from user profile (fallback to organization phone)
            const consultant = await this.prisma.user.findUnique({
                where: { id: user.userId },
                include: { organization: true }
            });

            if (!consultant) {
                console.error(`Consultant profile not found for user ${user.userId}`);
                throw new InternalServerErrorException('Consultant profile not found');
            }

            const consultantPhone = consultant.phone || consultant.organization?.phone;

            if (!consultantPhone) {
                console.warn(`No phone number found for consultant ${user.userId}`);
                throw new BadRequestException('Consultant does not have a phone number configured in their profile. Please update your profile.');
            }

            console.log(`Initiating call for lead ${id} from consultant ${user.userId}`);
            return await this.callingService.initiateCall({
                from: consultantPhone,
                to: lead.phone,
                leadId: lead.id,
                consultantId: user.userId
            });
        } catch (error) {
            console.error('Call initiation error:', error);
            // Re-throw if it's already an HTTP exception
            if (error.status) {
                throw error;
            }
            // Otherwise wrap in InternalServerErrorException
            throw new InternalServerErrorException(`Failed to initiate call: ${error.message || 'Unknown error'}`);
        }
    }

    async sendVideoCallLink(id: string, dto: SendVideoCallLinkDto, user: AuthenticatedUser) {
        try {
            // Get the lead
            const lead = await this.prisma.lead.findUnique({
                where: { id },
                include: {
                    project: true,
                    assignedToUser: true,
                },
            });

            if (!lead) {
                throw new NotFoundException(`Lead with ID ${id} not found`);
            }

            // Authorization check
            const isCentralAuthority = user.roles?.includes(UserRole.CENTRAL_AUTHORITY);
            const isGrowthPartner = user.roles?.includes(UserRole.GROWTH_PARTNER);
            const isConsultant = user.roles?.includes(UserRole.CONSULTANT);
            const isAssignedConsultant = lead.assignedTo === user.userId;
            const isUnassignedLead = !lead.assignedTo;

            if (!isCentralAuthority && !isGrowthPartner && !(isConsultant && (isAssignedConsultant || isUnassignedLead))) {
                throw new NotFoundException(`Lead with ID ${id} not found`);
            }

            // Validate contact info
            if (dto.channel === 'email' && !lead.email) {
                throw new BadRequestException('Lead does not have an email address');
            }
            if (dto.channel === 'whatsapp' && !lead.phone) {
                throw new BadRequestException('Lead does not have a phone number');
            }

            // Get consultant info
            const consultant = await this.prisma.user.findUnique({
                where: { id: user.userId },
            });

            if (!consultant) {
                throw new InternalServerErrorException('Consultant profile not found');
            }

            // Strictly use leadId as the persistent room name
            const videoRoomName = lead.id;
            if (lead.videoCallRoom !== videoRoomName) {
                // Update it in lead so it's consistent across all channels
                await this.prisma.lead.update({
                    where: { id },
                    data: { videoCallRoom: videoRoomName }
                });
            }

            const videoCallLink = `${this.configService.get('APP_URL') || 'http://localhost:3000'}/join-call/${videoRoomName}?leadName=${encodeURIComponent(lead.name || 'Guest')}`;

            // Log the communication in Lead notes
            await this.prisma.lead.update({
                where: { id },
                data: {
                    notes: (lead.notes || '') + `\n[${new Date().toISOString()}] Video call link sent via ${dto.channel}: ${videoCallLink}`,
                },
            });

            if (dto.channel === 'whatsapp' && lead.phone) {
                const whatsappResponse = await this.whatsappService.sendVideoCallLink(
                    lead.phone,
                    lead.name || 'Guest',
                    videoCallLink
                );

                if (!whatsappResponse.success) {
                    throw new BadRequestException('Failed to send WhatsApp message');
                }

                // Log Activity
                const log = await this.activityLogsService.log({
                    userId: user.userId,
                    type: 'info',
                    action: 'Sent Video Call Link (WhatsApp)',
                    target: lead.name,
                    details: { channel: 'whatsapp', videoCallLink }
                });

                // Link to lead
                await this.prisma.activityLog.update({
                    where: { id: log.id },
                    data: { leadId: lead.id }
                });
            }

            if (dto.channel === 'email' && lead.email) {
                const mailResponse = await this.mailService.sendVideoCallInvitation(
                    lead.email,
                    lead.name || 'Guest',
                    videoCallLink
                );

                if (!mailResponse.success) {
                    throw new BadRequestException(`Failed to send email: ${mailResponse.error}`);
                }

                 // Log Activity
                 const log = await this.activityLogsService.log({
                    userId: user.userId,
                    type: 'info',
                    action: 'Sent Video Call Link (Email)',
                    target: lead.name,
                    details: { channel: 'email', videoCallLink }
                });

                // Link to lead
                await this.prisma.activityLog.update({
                    where: { id: log.id },
                    data: { leadId: lead.id }
                });
            }

            return {
                success: true,
                message: `Video call link sent successfully for ${dto.channel}`,
                videoCallLink: videoCallLink,
            };
        } catch (error) {
            console.error('Send video call link error:', error);
            if (error.status) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Failed to send video call link: ${error.message || 'Unknown error'}`
            );
        }
    }

    async generateVideoCallRoom(id: string, user: AuthenticatedUser) {
        const lead = await this.prisma.lead.findUnique({
            where: { id },
        });

        if (!lead) {
            throw new NotFoundException(`Lead with ID ${id} not found`);
        }

        // Strictly use leadId as the persistent room name
        const videoRoomName = lead.id;
        if (lead.videoCallRoom !== videoRoomName) {
            // Save it to lead
            await this.prisma.lead.update({
                where: { id },
                data: { videoCallRoom: videoRoomName }
            });
        }

        const videoCallLink = `${this.configService.get('APP_URL') || 'http://localhost:3000'}/join-call/${videoRoomName}?leadName=${encodeURIComponent(lead.name || 'Guest')}`;

        // Log Activity
        const log = await this.activityLogsService.log({
            userId: user.userId,
            type: 'info',
            action: 'Generated Video Call Room',
            target: lead.name,
            details: { videoCallLink }
        });

        await this.prisma.activityLog.update({
            where: { id: log.id },
            data: { leadId: lead.id }
        });

        return {
            success: true,
            videoRoomName,
            videoCallLink
        };
    }
}
