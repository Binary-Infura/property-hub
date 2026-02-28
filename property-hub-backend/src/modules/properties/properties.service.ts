import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePropertyDto, UpdatePropertyDto } from './properties.dto';
import { Property } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class PropertiesService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
        private activityLogsService: ActivityLogsService,
    ) { }

    async findAll(user: AuthenticatedUser | undefined, myOnly?: boolean, city?: string): Promise<Property[]> {
        const isCentralAuthority = user?.roles?.includes('central-authority') || false;
        const isPropertyPartner = user?.roles?.includes('property-partner') || false;
        const isGlobalRole = user?.roles?.some(role =>
            ['central-authority', 'property-partner', 'buyer', 'consultant', 'loan-adviser', 'marketing-manager', 'onboarding-manager', 'channel-partner', 'visit-executive', 'service-provider'].includes(role)
        ) || false;



        let where: any = {};

        if (city) {
            where.OR = [
                { city: { name: { contains: city, mode: 'insensitive' } } },
                { location: { contains: city, mode: 'insensitive' } },
                { address: { contains: city, mode: 'insensitive' } }
            ];
        }

        if (myOnly) {
            const internalUser = await this.usersService.ensureUserSynced(user);
            where.onboardedById = internalUser.id;
        }

        const results = await this.prisma.property.findMany({
            where,
            include: {
                onboardedBy: true,
                assignedTo: true,
                city: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return results;
    }

    async findOne(id: string, user?: AuthenticatedUser): Promise<Property> {
        const property = await this.prisma.property.findUnique({
            where: { id },
            include: {
                commissions: true,
                assignedTo: true,
                onboardedBy: true,
                city: true,
            },
        });

        if (!property) {
            throw new NotFoundException(`Property with ID ${id} not found`);
        }

        if (user) {
            const isCentralAuthority = user.roles.includes('central-authority');
            const userRegions = (user.groups || []).map(g => g.split('/').pop());

            // Check ownership
            const internalUser = await this.usersService.ensureUserSynced(user);
            const isOwner = property.onboardedById === internalUser.id;


        }

        return property;
    }


    async create(createPropertyDto: CreatePropertyDto, user?: AuthenticatedUser): Promise<Property> {
        let onboardedById = createPropertyDto.onboardedById;

        if (!onboardedById && user) {
            const internalUser = await this.usersService.ensureUserSynced(user);
            onboardedById = internalUser.id;
        }

        const { cityId, ...rest } = createPropertyDto;

        const data: any = {
            ...rest,
            cityId,
            onboardedById,
        };



        const property = await this.prisma.property.create({
            data,
            include: {

                onboardedBy: true,
            },
        });

        // Use the performing user's ID for the log
        const internalUser = user ? await this.usersService.ensureUserSynced(user) : null;

        await this.activityLogsService.log({
            userId: internalUser?.id || data.onboardedById,
            type: 'info',
            action: 'Property Onboarded',
            target: property.name,
            details: { propertyId: property.id }
        });

        return property;
    }

    async update(id: string, updatePropertyDto: UpdatePropertyDto, user: AuthenticatedUser): Promise<Property> {
        const property = await this.findOne(id, user);

        const { cityId, ...rest } = updatePropertyDto;

        const data: any = {
            ...rest,
            cityId,
        };

        return this.prisma.property.update({
            where: { id },
            data,
            include: {

                onboardedBy: true,
            },
        });
    }

    async remove(id: string, user: AuthenticatedUser): Promise<Property> {
        await this.findOne(id, user);
        return this.prisma.property.delete({
            where: { id },
        });
    }

    async assignConsultants(id: string, consultantIds: string[], user: AuthenticatedUser): Promise<Property> {
        const isPropertyPartner = user.roles.includes('property-partner');
        const isCentralAuthority = user.roles.includes('central-authority');

        if (isPropertyPartner) {
            // Verify property ownership
            const property = await this.prisma.property.findUnique({
                where: { id },
                select: { onboardedById: true }
            });

            const internalUser = await this.usersService.ensureUserSynced(user);
            if (!property || property.onboardedById !== internalUser.id) {
                throw new BadRequestException('You can only allocate properties you have onboarded.');
            }

            // Verify agents ownership (all consultants must be onboarded by this partner)
            const agentsCount = await this.prisma.user.count({
                where: {
                    id: { in: consultantIds },
                    onboardedById: internalUser.id
                }
            });

            if (agentsCount !== consultantIds.length) {
                throw new BadRequestException('You can only allocate properties to agents you have onboarded.');
            }
        } else if (!isCentralAuthority) {
            throw new BadRequestException('You do not have permission to allocate properties.');
        }

        const result = await this.prisma.property.update({
            where: { id },
            data: {
                assignedTo: {
                    set: consultantIds.map(id => ({ id }))
                }
            },
            include: {
                assignedTo: true,
                onboardedBy: true,
            }
        });

        const internalUser = user ? await this.usersService.ensureUserSynced(user) : null;

        await this.activityLogsService.log({
            userId: internalUser?.id,
            type: 'info',
            action: 'Property Allocated',
            target: result.name,
            details: { consultantIds, propertyId: result.id }
        });

        return result;
    }

    async bulkAssignConsultants(propertyIds: string[], consultantIds: string[], user: AuthenticatedUser) {
        const isPropertyPartner = user.roles.includes('property-partner');
        const isCentralAuthority = user.roles.includes('central-authority');

        if (isPropertyPartner) {
            const internalUser = await this.usersService.ensureUserSynced(user);

            // Verify all properties ownership
            const propsCount = await this.prisma.property.count({
                where: {
                    id: { in: propertyIds },
                    onboardedById: internalUser.id
                }
            });

            if (propsCount !== propertyIds.length) {
                throw new BadRequestException('You can only allocate properties you have onboarded.');
            }

            // Verify all agents ownership
            const agentsCount = await this.prisma.user.count({
                where: {
                    id: { in: consultantIds },
                    onboardedById: internalUser.id
                }
            });

            if (agentsCount !== consultantIds.length) {
                throw new BadRequestException('You can only allocate properties to agents you have onboarded.');
            }
        } else if (!isCentralAuthority) {
            throw new BadRequestException('You do not have permission to allocate properties.');
        }

        const updates = propertyIds.map(propertyId =>
            this.prisma.property.update({
                where: { id: propertyId },
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
