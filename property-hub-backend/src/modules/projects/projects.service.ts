import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
import { Project } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { UserRole } from '../../common/enums/role.enum';

@Injectable()
export class ProjectsService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
        private activityLogsService: ActivityLogsService,
    ) { }

    async findAll(user: AuthenticatedUser | undefined, myOnly?: boolean, city?: string, status?: string): Promise<Project[]> {
        const isCentralAuthority = user?.roles?.includes(UserRole.CENTRAL_AUTHORITY) || false;
        const isPropertyPartner = user?.roles?.includes(UserRole.PROPERTY_PARTNER) || false;
        const allRoles = Object.values(UserRole);
        const isGlobalRole = user?.roles?.some(role => allRoles.includes(role as UserRole)) || false;



        let where: any = {};

        if (status) {
            where.status = status;
        } else if (!myOnly && !isCentralAuthority && !isPropertyPartner) {
            // For public search/buyers, only show approved projects by default
            where.status = 'APPROVED';
        }

        if (city) {
            where.addressRecord = {
                OR: [
                    { city: { name: { contains: city, mode: 'insensitive' } } },
                    { line1: { contains: city, mode: 'insensitive' } },
                    { line2: { contains: city, mode: 'insensitive' } }
                ]
            };
        }

        if (myOnly) {
            const internalUser = await this.usersService.ensureUserSynced(user);
            where.onboardedById = internalUser.id;
        }

        const results = await this.prisma.project.findMany({
            where,
            include: {
                addressRecord: {
                    include: {
                        city: true
                    }
                },
                onboardedBy: {
                    include: {
                        organization: true,
                    },
                },
                assignedTo: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return results;
    }

    async findOne(id: string, user?: AuthenticatedUser): Promise<Project> {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                addressRecord: {
                    include: {
                        city: true
                    }
                },
                commissions: true,
                assignedTo: true,
                onboardedBy: {
                    include: {
                        organization: true,
                    },
                },
                towers: {
                    include: {
                        units: true,
                    },
                },
            },
        });

        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        if (user) {
            const isCentralAuthority = user.roles.includes(UserRole.CENTRAL_AUTHORITY as string);

            // Check ownership
            const internalUser = await this.usersService.ensureUserSynced(user);
            const isOwner = project.onboardedById === internalUser.id;
        }

        return project;
    }


    async create(createProjectDto: CreateProjectDto, user?: AuthenticatedUser): Promise<Project> {
        let onboardedById = createProjectDto.onboardedById;

        if (!onboardedById && user) {
            const internalUser = await this.usersService.ensureUserSynced(user);
            onboardedById = internalUser.id;
        }

        const { addressRecord, ...rest } = createProjectDto;

        const data: any = {
            ...rest,
            onboardedById,
        };

        if (addressRecord) {
            data.addressRecord = {
                create: addressRecord
            };
        }



        const project = await this.prisma.project.create({
            data,
            include: {
                addressRecord: {
                    include: {
                        city: true
                    }
                },
                onboardedBy: {
                    include: {
                        organization: true,
                    },
                },
            },
        });

        // Use the performing user's ID for the log
        const internalUser = user ? await this.usersService.ensureUserSynced(user) : null;

        await this.activityLogsService.log({
            userId: internalUser?.id || data.onboardedById,
            type: 'info',
            action: 'Project Onboarded',
            target: project.name,
            details: { projectId: project.id }
        });

        return project;
    }

    async update(id: string, updateProjectDto: UpdateProjectDto, user: AuthenticatedUser): Promise<Project> {
        const project = await this.findOne(id, user);

        const { addressRecord, ...rest } = updateProjectDto;

        const data: any = {
            ...rest,
        };

        if (addressRecord) {
            if ((project as any).addressId) {
                data.addressRecord = {
                    update: addressRecord
                };
            } else {
                data.addressRecord = {
                    create: addressRecord
                };
            }
        }

        const projectAfter = await this.prisma.project.update({
            where: { id },
            data,
            include: {
                addressRecord: {
                    include: {
                        city: true
                    }
                },
                onboardedBy: {
                    include: {
                        organization: true,
                    },
                },
            },
        });

        return projectAfter;
    }

    async remove(id: string, user: AuthenticatedUser): Promise<Project> {
        await this.findOne(id, user);
        return this.prisma.project.delete({
            where: { id },
        });
    }

    async assignConsultants(id: string, consultantIds: string[], user: AuthenticatedUser): Promise<Project> {
        const isPropertyPartner = user.roles.includes(UserRole.PROPERTY_PARTNER);
        const isCentralAuthority = user.roles.includes(UserRole.CENTRAL_AUTHORITY);

        if (!isCentralAuthority && isPropertyPartner) {
            // Verify project ownership
            const project = await this.prisma.project.findUnique({
                where: { id },
                select: { onboardedById: true }
            });

            const internalUser = await this.usersService.ensureUserSynced(user);
            if (!project || project.onboardedById !== internalUser.id) {
                throw new BadRequestException('You can only allocate projects you have onboarded.');
            }

            // Verify agents ownership (all consultants must be onboarded by this partner)
            const agentsCount = await this.prisma.user.count({
                where: {
                    id: { in: consultantIds },
                    onboardedById: internalUser.id
                }
            });

            if (agentsCount !== consultantIds.length) {
                throw new BadRequestException('You can only allocate projects to agents you have onboarded.');
            }
        } else if (!isCentralAuthority) {
            throw new BadRequestException('You do not have permission to allocate projects.');
        }

        const result = await this.prisma.project.update({
            where: { id },
            data: {
                assignedTo: {
                    set: consultantIds.map(id => ({ id }))
                }
            },
            include: {
                assignedTo: true,
                onboardedBy: {
                    include: {
                        organization: true,
                    },
                },
            }
        });

        const internalUser = user ? await this.usersService.ensureUserSynced(user) : null;

        await this.activityLogsService.log({
            userId: internalUser?.id,
            type: 'info',
            action: 'Project Allocated',
            target: result.name,
            details: { consultantIds, projectId: result.id }
        });

        return result;
    }

    async bulkAssignConsultants(projectIds: string[], consultantIds: string[], user: AuthenticatedUser) {
        const isPropertyPartner = user.roles.includes(UserRole.PROPERTY_PARTNER);
        const isCentralAuthority = user.roles.includes(UserRole.CENTRAL_AUTHORITY);

        if (!isCentralAuthority && isPropertyPartner) {
            const internalUser = await this.usersService.ensureUserSynced(user);

            // Verify all projects ownership
            const propsCount = await this.prisma.project.count({
                where: {
                    id: { in: projectIds },
                    onboardedById: internalUser.id
                }
            });

            if (propsCount !== projectIds.length) {
                throw new BadRequestException('You can only allocate projects you have onboarded.');
            }

            // Verify all agents ownership
            const agentsCount = await this.prisma.user.count({
                where: {
                    id: { in: consultantIds },
                    onboardedById: internalUser.id
                }
            });

            if (agentsCount !== consultantIds.length) {
                throw new BadRequestException('You can only allocate projects to agents you have onboarded.');
            }
        } else if (!isCentralAuthority) {
            throw new BadRequestException('You do not have permission to allocate projects.');
        }

        const updates = projectIds.map(projectId =>
            this.prisma.project.update({
                where: { id: projectId },
                data: {
                    assignedTo: {
                        set: consultantIds.map(id => ({ id }))
                    }
                }
            })
        );
        return this.prisma.$transaction(updates);
    }
}
