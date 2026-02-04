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

    async findAll(user: AuthenticatedUser, regionCode: string, myOnly?: boolean): Promise<Property[]> {
        const isCentralAuthority = user.roles.includes('central-authority');
        const isPropertyPartner = user.roles.includes('property-partner');
        const userRegions = user.groups.map(g => g.split('/').pop());

        // Check if user has access to the requested region
        if (!isCentralAuthority && !isPropertyPartner && !userRegions.includes(regionCode)) {
            return []; // User has no access to this region's properties
        }

        let where: any = {};

        // Property Partners and Central Authority can view properties across regions if they want,
        // but for now we follow the regionCode unless they are property-partner viewing "myOnly"
        if (isPropertyPartner && myOnly) {
            // Global view for property partners of their own properties
        } else {
            where.region = { code: regionCode };
        }

        if (myOnly) {
            // Ensure user is synced and use their internal ID
            const internalUser = await this.usersService.ensureUserSynced(user);
            where.onboardedById = internalUser.id;
        }

        return this.prisma.property.findMany({
            where,
            include: {
                region: true,
                onboardedBy: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
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

        // Check region access (skip if owner or central authority)
        if (!isCentralAuthority && !isOwner) {
            // If property has no region, only CA or Owner can see it (which we handled above)
            if (!property.regionId) {
                throw new NotFoundException(`Property with ID ${id} not found`);
            }
            // If property has region, check if user has access to it
            if (!userRegions.includes(property.region?.code)) {
                // Note: userRegions contains codes like 'mumbai', property.regionId is UUID. 
                // We need to match codes. The property include 'region' is true, so property.region.code should be available used.
                // However, the original code used `userRegions.includes(property.regionId)` which seems wrong if userRegions are codes!
                // Let's fix this logic too. If property.region is loaded, compare codes.
                if (property.region && !userRegions.includes(property.region.code)) {
                    throw new NotFoundException(`Property with ID ${id} not found`);
                }
                // If original code was checking UUID against codes, that was definitely a bug or I misunderstood 'userRegions'.
                // Assuming userRegions are codes (from split('/').pop()), we must compare with property.region.code.
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
