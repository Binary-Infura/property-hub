import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto, UpdateLeadDto } from './leads.dto';
import { Lead } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { ExotelService } from '../exotel/exotel.service';

@Injectable()
export class LeadsService {
    constructor(
        private prisma: PrismaService,
        private exotelService: ExotelService,
    ) { }

    async findAll(user: AuthenticatedUser): Promise<Lead[]> {
        const isCentralAuthority = user.roles.includes('central-authority');
        const isMarketingManager = user.roles.includes('marketing-manager');
        const isBuyer = user.roles.includes('buyer');

        let where: any = {};
        if (isBuyer) {
            where.OR = [
                { email: user.email || undefined },
                { phone: user.phone || undefined }
            ];
            // Remove undefined values from OR array
            where.OR = where.OR.filter((item: any) => Object.values(item)[0] !== undefined);
            if (where.OR.length === 0) return [];
        } else if (!isCentralAuthority && !isMarketingManager) {
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
        const isCentralAuthority = user.roles.includes('central-authority');

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
                    const details = await this.exotelService.getCallDetails(call.sid);
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

        return lead;
    }

    async create(createLeadDto: CreateLeadDto): Promise<Lead> {
        try {
            const { projectId, campaignId, assignedTo, ...data } = createLeadDto;

            return await this.prisma.lead.create({
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
        await this.findOne(id, user);
        const { projectId, campaignId, assignedTo, ...data } = updateLeadDto;

        return this.prisma.lead.update({
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
    }

    async remove(id: string, user: AuthenticatedUser): Promise<Lead> {
        await this.findOne(id, user);

        return this.prisma.lead.delete({
            where: { id },
        });
    }

    async initiateCall(id: string, user: AuthenticatedUser) {
        try {
            const lead = await this.findOne(id, user);

            if (!lead.phone) {
                throw new Error('Lead does not have a phone number');
            }

            // Get consultant phone from user profile
            const consultant = await this.prisma.user.findUnique({
                where: { id: user.userId },
                include: { userMetadata: true },
            });

            const consultantPhone = consultant?.phone || consultant?.userMetadata?.phone;

            if (!consultantPhone) {
                throw new Error('Consultant does not have a phone number configured in their profile. Please update your profile.');
            }

            return await this.exotelService.makeCall(consultantPhone, lead.phone, lead.id, user.userId);
        } catch (error) {
            console.error('Call initiation error:', error);
            throw error;
        }
    }
}
