import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateVisitDto, UpdateVisitDto } from './visits.dto';
import { Visit, UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class VisitsService {
    constructor(private prisma: PrismaService) {}

    async findAll(user: AuthenticatedUser): Promise<Visit[]> {
        const isCentralAuthority = user.roles.includes('CENTRAL_AUTHORITY');
        const isMarketingManager = user.roles.includes('MARKETING_MANAGER');
        const isConsultant = user.roles.includes('CONSULTANT');
        const isVisitExecutive = user.roles.includes('VISIT_EXECUTIVE');
        const isPropertyPartner = user.roles.includes('PROPERTY_PARTNER');

        let where: any = {};

        if (isCentralAuthority || isMarketingManager) {
            // Can see all visits
            where = {};
        } else if (isVisitExecutive) {
            // Can only see visits assigned to them
            where.visitExecutiveId = user.userId;
        } else if (isConsultant) {
            // Can see visits for leads assigned to them OR leads in projects assigned to them
            where.OR = [
                { lead: { assignedTo: user.userId } },
                { lead: { project: { assignedTo: { some: { id: user.userId } } } } }
            ];
        } else if (isPropertyPartner) {
            // Property partners can see all visits for now (or restricted to their projects)
            where = {};
        } else {
            // Other roles might have restricted access, for now keep it empty or throw
            throw new ForbiddenException('You do not have permission to view visits');
        }

        return this.prisma.visit.findMany({
            where,
            include: {
                lead: {
                    include: {
                        project: true,
                        assignedToUser: {
                            select: {
                                firstName: true,
                                lastName: true,
                                phone: true
                            }
                        }
                    }
                },
                visitExecutive: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        email: true
                    }
                }
            },
            orderBy: {
                scheduledAt: 'desc'
            }
        });
    }

    async findOne(id: string, user: AuthenticatedUser): Promise<Visit> {
        const visit = await this.prisma.visit.findUnique({
            where: { id },
            include: {
                lead: {
                    include: {
                        project: true
                    }
                },
                visitExecutive: true
            }
        });

        if (!visit) {
            throw new NotFoundException(`Visit with ID ${id} not found`);
        }

        // Add authorization check here if needed
        return visit;
    }

    async create(createVisitDto: CreateVisitDto): Promise<Visit> {
        const { leadId, visitExecutiveId, scheduledAt, notes } = createVisitDto;

        // Check if lead exists
        const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead) {
            throw new NotFoundException(`Lead with ID ${leadId} not found`);
        }

        // If visitExecutiveId is provided, check if user exists and has correct role
        if (visitExecutiveId) {
            const executive = await this.prisma.user.findUnique({ where: { id: visitExecutiveId } });
            if (!executive || !executive.roles.includes('VISIT_EXECUTIVE' as any)) {
                throw new BadRequestException('Invalid Visit Executive selected');
            }
        }

        return this.prisma.visit.create({
            data: {
                leadId,
                visitExecutiveId,
                scheduledAt: new Date(scheduledAt),
                notes,
                status: 'SCHEDULED'
            },
            include: {
                lead: true,
                visitExecutive: true
            }
        });
    }

    async update(id: string, updateVisitDto: UpdateVisitDto): Promise<Visit> {
        const visit = await this.prisma.visit.findUnique({ where: { id } });
        if (!visit) {
            throw new NotFoundException(`Visit with ID ${id} not found`);
        }

        const { scheduledAt, visitExecutiveId, status, notes } = updateVisitDto;

        return this.prisma.visit.update({
            where: { id },
            data: {
                scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
                visitExecutiveId,
                status,
                notes
            },
            include: {
                lead: true,
                visitExecutive: true
            }
        });
    }

    async remove(id: string): Promise<Visit> {
        return this.prisma.visit.delete({
            where: { id }
        });
    }

    /**
     * Finds visit executives assigned to a specific project.
     * This fulfills the requirement: "show visit executive based on project allocated they have"
     */
    async findExecutivesForProject(projectId: string) {
        return this.prisma.user.findMany({
            where: {
                roles: { has: 'VISIT_EXECUTIVE' as any },
                assignedProjects: {
                    some: { id: projectId }
                },
                status: 'ACTIVE'
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                profileData: true
            }
        });
    }
}
