import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto, UpdateLeadDto } from './leads.dto';
import { Lead } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums/role.enum';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { MailService } from '../mail/mail.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { OtpService } from '../otp/otp.service';

@Injectable()
export class LeadsService {
    constructor(
        private prisma: PrismaService,
        private whatsappService: WhatsappService,
        private mailService: MailService,
        private activityLogsService: ActivityLogsService,
        private otpService: OtpService,
    ) { }

    async findAll(user: AuthenticatedUser): Promise<Lead[]> {
        const isCentralAuthority = user.roles.includes(UserRole.CENTRAL_AUTHORITY);
        const isBuyer = user.roles.includes(UserRole.BUYER);

        let where: any = {};
        if (isCentralAuthority) {
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

    async findOne(id: string, user: AuthenticatedUser): Promise<Lead> {
        const lead = await this.prisma.lead.findUnique({
            where: { id },
            include: {
                project: true,
            },
        });

        if (!lead) {
            throw new NotFoundException(`Lead with ID ${id} not found`);
        }

        // Authorization check: only central-authority and the assigned consultant can access the lead
        const isCentralAuthority = user.roles.includes(UserRole.CENTRAL_AUTHORITY);
        const isPropertyPartner = user.roles.includes(UserRole.PROPERTY_PARTNER);
        const isAssignedConsultant = lead.assignedTo === user.userId;

        if (!isCentralAuthority && !isPropertyPartner && !isAssignedConsultant) {
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
}
