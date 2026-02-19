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

    async findAll(user: AuthenticatedUser | undefined, regionCode: string, myOnly?: boolean, city?: string): Promise<Property[]> {
        const isCentralAuthority = user?.roles?.includes('central-authority') || false;
        const isPropertyPartner = user?.roles?.includes('property-partner') || false;
        const isGlobalRole = user?.roles?.some(role =>
            ['central-authority', 'property-partner', 'buyer', 'consultant', 'loan-adviser', 'marketing-manager', 'commission-manager', 'onboarding-manager', 'regional-manager', 'channel-partner', 'visit-executive', 'service-provider'].includes(role)
        ) || false;

        // Check if user has access to the requested city
        if (user && !isGlobalRole && city) {
            const citySlug = city.toLowerCase().replace(/\s+/g, '-');
            const hasAccess = (user.groups || []).some(g => g.endsWith(`/${citySlug}`));

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
                { locationRel: { city: { contains: city, mode: 'insensitive' } } }
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
                locationRel: true,
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
                locationRel: true,
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

            // Check city access (skip if owner or central authority)
            if (!isCentralAuthority && !isOwner) {
                const hasLocationCityAccess = property.locationRel?.city && userRegions.some(g => g.toLowerCase() === property.locationRel.city.toLowerCase());

                if (!hasLocationCityAccess) {
                    throw new NotFoundException(`Property with ID ${id} not found`);
                }
            }
        }

        return property;
    }

    private async resolveLocationId(dto: CreatePropertyDto | UpdatePropertyDto): Promise<string | undefined> {
        if (dto.locationId) return dto.locationId;

        if (dto.continent && dto.country && dto.state && dto.city) {
            const location = await this.prisma.location.upsert({
                where: {
                    continent_country_state_city: {
                        continent: dto.continent,
                        country: dto.country,
                        state: dto.state,
                        city: dto.city,
                    },
                },
                update: {},
                create: {
                    continent: dto.continent,
                    country: dto.country,
                    state: dto.state,
                    city: dto.city,
                },
            });
            return location.id;
        }
        return undefined;
    }

    async create(createPropertyDto: CreatePropertyDto, user?: AuthenticatedUser): Promise<Property> {
        let onboardedById = createPropertyDto.onboardedById;

        if (!onboardedById && user) {
            const internalUser = await this.usersService.ensureUserSynced(user);
            onboardedById = internalUser.id;
        }

        const locationId = await this.resolveLocationId(createPropertyDto);

        const { continent, country, state, city, locationId: _, ...rest } = createPropertyDto;

        const data: any = {
            ...rest,
            city, // Still keep for backward compatibility in existing where clauses
            onboardedById,
            locationId,
        };



        return this.prisma.property.create({
            data,
            include: {

                locationRel: true,
            },
        });
    }

    async update(id: string, updatePropertyDto: UpdatePropertyDto, user: AuthenticatedUser): Promise<Property> {
        const property = await this.findOne(id, user);

        const locationId = await this.resolveLocationId(updatePropertyDto);

        const { continent, country, state, city, locationId: _, ...rest } = updatePropertyDto;

        const data: any = {
            ...rest,
            city,
            locationId,
        };

        return this.prisma.property.update({
            where: { id },
            data,
            include: {

                locationRel: true,
            },
        });
    }

    async remove(id: string, user: AuthenticatedUser): Promise<Property> {
        await this.findOne(id, user);
        return this.prisma.property.delete({
            where: { id },
        });
    }
}
