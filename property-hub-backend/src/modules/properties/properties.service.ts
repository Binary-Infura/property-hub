import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePropertyDto, UpdatePropertyDto } from './properties.dto';
import { Property } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class PropertiesService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
    ) { }

    async findAll(user: AuthenticatedUser, regionCode: string, myOnly?: boolean, city?: string): Promise<Property[]> {
        const isCentralAuthority = user.roles.includes('central-authority');
        const isPropertyPartner = user.roles.includes('property-partner');
        const isOnboardingManager = user.roles.includes('onboarding-manager');
        const userRegions = (user.groups || []).map(g => g.split('/').pop());

        // Check if user has access to the requested region or city
        if (!isCentralAuthority && !isPropertyPartner) {
            let hasAccess = (user.groups || []).some(g => g.endsWith(`/${regionCode}`));

            if (!hasAccess && city) {
                const citySlug = city.toLowerCase().replace(/\s+/g, '-');
                hasAccess = (user.groups || []).some(g => g.endsWith(`/${citySlug}`));
            }

            if (!hasAccess && regionCode !== 'no-region') {
                // Check if regionCode belongs to any of user's cities
                const region = await this.prisma.region.findUnique({ where: { code: regionCode } });
                const citySlug = region?.city?.toLowerCase().replace(/\s+/g, '-');
                hasAccess = citySlug && (user.groups || []).some(g => g.endsWith(`/${citySlug}`));
            }

            if (!hasAccess) {
                return []; // Access denied
            }
        }

        let where: any = {};

        if (city) {
            where.OR = [
                { city: { contains: city, mode: 'insensitive' } },
                { location: { contains: city, mode: 'insensitive' } },
                { address: { contains: city, mode: 'insensitive' } },
            ];
        } else if (isPropertyPartner && myOnly) {
            // Global view for property partners of their own properties
        } else {
            where.region = { code: regionCode };
        }

        if (myOnly) {
            const internalUser = await this.usersService.ensureUserSynced(user);
            where.onboardedById = internalUser.id;
        }

        console.log(`[findAll] Region: ${regionCode}, City: ${city}, MyOnly: ${myOnly}`);
        console.log(`[findAll] Where clause:`, JSON.stringify(where, null, 2));

        const results = await this.prisma.property.findMany({
            where,
            include: {
                region: true,
                onboardedBy: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        console.log(`[findAll] Found ${results.length} properties`);
        return results;
    }

    async findOne(id: string, user: AuthenticatedUser): Promise<Property> {
        const property = await this.prisma.property.findUnique({
            where: { id },
            include: {
                region: true,
                commissions: true,
            },
        });

        if (!property) {
            throw new NotFoundException(`Property with ID ${id} not found`);
        }

        const isCentralAuthority = user.roles.includes('central-authority');
        const userRegions = user.groups.map(g => g.split('/').pop());

        // Check ownership
        const internalUser = await this.usersService.ensureUserSynced(user);
        const isOwner = property.onboardedById === internalUser.id;

        // Check region/city access (skip if owner or central authority)
        if (!isCentralAuthority && !isOwner) {
            const hasRegionAccess = property.region && userRegions.includes(property.region.code);
            const hasCityAccess = (property as any).city && userRegions.some(g => g.toLowerCase() === (property as any).city?.toLowerCase());
            const hasRegionCityAccess = property.region?.city && userRegions.some(g => g.toLowerCase() === property.region.city.toLowerCase());

            if (!hasRegionAccess && !hasCityAccess && !hasRegionCityAccess) {
                throw new NotFoundException(`Property with ID ${id} not found`);
            }
        }

        return property;
    }

    async create(createPropertyDto: CreatePropertyDto, user?: AuthenticatedUser): Promise<Property> {
        let onboardedById = createPropertyDto.onboardedById;

        if (!onboardedById && user) {
            const internalUser = await this.usersService.ensureUserSynced(user);
            onboardedById = internalUser.id;
        }

        const { regionId, ...rest } = createPropertyDto;

        const data: any = {
            ...rest,
            onboardedById,
        };

        if (regionId) {
            data.regionId = regionId;
        }

        return this.prisma.property.create({
            data,
            include: {
                region: true,
            },
        });
    }

    async update(id: string, updatePropertyDto: UpdatePropertyDto, user: AuthenticatedUser): Promise<Property> {
        // Verify property exists and user has access
        await this.findOne(id, user);

        return this.prisma.property.update({
            where: { id },
            data: updatePropertyDto,
            include: {
                region: true,
            },
        });
    }

    async remove(id: string, user: AuthenticatedUser): Promise<Property> {
        // Verify property exists and user has access
        await this.findOne(id, user);

        return this.prisma.property.delete({
            where: { id },
        });
    }
}
