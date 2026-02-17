import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    CreateRegionDto,
    UpdateRegionDto,
    GetRegionAllocationsQueryDto,
    GetAllRegionsQueryDto,
    AssignRegionDto,
    UpdateRegionAssignmentDto,
    RegionAllocationResponseDto,
    RegionPaginatedAllocationResponseDto,
    ManagerRole,
} from './regions.dto';
import { Region } from '@prisma/client';
@Injectable()
export class RegionsService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async findAll(query: GetAllRegionsQueryDto, options: { includeInactive?: boolean } = {}): Promise<{ data: Region[], total: number }> {
        // Auto-sync missing continents for legacy data


        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (!options.includeInactive) {
            where.active = true;
        }

        if (query.continent || query.country || query.state || query.city) {
            where.location = {};
            if (query.continent) where.location.continent = { contains: query.continent, mode: 'insensitive' };
            if (query.country) where.location.country = { contains: query.country, mode: 'insensitive' };
            if (query.state) where.location.state = { contains: query.state, mode: 'insensitive' };
            if (query.city) where.location.city = { contains: query.city, mode: 'insensitive' };
        }

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { code: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.region.findMany({
                where,
                include: { location: true },
                skip,
                take: limit,
                orderBy: { name: 'asc' },
            }),
            this.prisma.region.count({ where }),
        ]);

        return { data, total };
    }

    async findOne(id: string): Promise<Region> {
        const region = await this.prisma.region.findUnique({
            where: { id },
            include: { location: true },
        });

        if (!region) {
            throw new NotFoundException(`Region with ID ${id} not found`);
        }

        return region;
    }

    /**
     * Helper to populate missing continents for existing regions
     */


    private async resolveLocationId(dto: CreateRegionDto | UpdateRegionDto): Promise<string | undefined> {
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

    async create(createRegionDto: CreateRegionDto): Promise<Region> {
        let { postalCode, continent, country, state, city, ...rest } = createRegionDto;

        // If postal code is provided, fetch details and override location fields
        if (postalCode) {
            const pcData = await (this.prisma as any).postalCode.findFirst({
                where: { code: { equals: postalCode, mode: 'insensitive' } },
            });

            if (pcData) {
                continent = pcData.continent || continent || 'Asia'; // Default to Asia if not found
                country = pcData.country || pcData.countryName || country;
                state = pcData.state || pcData.stateName || state;
                city = pcData.city || pcData.officeName || pcData.district || city;
            }
        }

        let baseCode = '';

        if (createRegionDto.countryCode && createRegionDto.stateCode && createRegionDto.cityCode && createRegionDto.name) {
            const cCode = createRegionDto.countryCode.toLowerCase();
            const sCode = createRegionDto.stateCode.toLowerCase();
            const ciPrefix = createRegionDto.cityCode?.substring(0, 2).toLowerCase() || city?.substring(0, 2).toLowerCase();
            const loPrefix = createRegionDto.name.substring(0, 2).toLowerCase();
            baseCode = `${cCode}-${sCode}-${ciPrefix}-${loPrefix}`;
        } else {
            baseCode = createRegionDto.code || createRegionDto.name.toLowerCase().replace(/\s+/g, '-');
        }

        baseCode = baseCode.replace(/-\d+$/, '');

        let finalCode = `${baseCode}-01`;
        let counter = 1;

        while (true) {
            const existing = await this.prisma.region.findUnique({
                where: { code: finalCode },
            });
            if (!existing) break;

            counter++;
            const suffix = counter < 10 ? `0${counter}` : `${counter}`;
            finalCode = `${baseCode}-${suffix}`;
        }

        const locationId = await this.resolveLocationId({
            ...createRegionDto,
            continent,
            country,
            state,
            city
        });

        const { countryCode, stateCode, cityCode, ...dbData } = rest as any;

        // Build postal codes connection
        const postalCodesConnect: any = {};
        if (postalCode) {
            postalCodesConnect.connect = [{ code: postalCode }];
        }
        if (createRegionDto.postalCodes && createRegionDto.postalCodes.length > 0) {
            postalCodesConnect.connect = [
                ...(postalCodesConnect.connect || []),
                ...createRegionDto.postalCodes.map(code => ({ code }))
            ].filter((v, i, a) => a.findIndex(t => t.code === v.code) === i); // Remove duplicates
        }

        const region = await this.prisma.region.create({
            data: {
                ...(dbData as any),
                name: createRegionDto.name,
                locationId,
                code: finalCode,
                ...(postalCodesConnect.connect && postalCodesConnect.connect.length > 0 ? { postalCodes: postalCodesConnect } : {})
            },
            include: { location: true, postalCodes: true } as any,
        });

        return region;
    }

    async update(id: string, updateRegionDto: UpdateRegionDto): Promise<Region> {
        await this.findOne(id);

        const locationId = await this.resolveLocationId(updateRegionDto);

        const { countryCode, stateCode, cityCode, ...dbData } = updateRegionDto as any;

        return this.prisma.region.update({
            where: { id },
            data: {
                ...(dbData as any),
                locationId,
            },
            include: { location: true },
        });
    }

    async remove(id: string): Promise<Region> {
        await this.findOne(id);

        // Note: In a real app, you might want to check if there are properties/leads attached
        return this.prisma.region.delete({
            where: { id },
        });
    }

    /**
     * Internal methods for maintenance can go here
     */

    /**
     * Get all regions with their assigned users, with optional filtering
     */
    async getAllocations(filters: GetRegionAllocationsQueryDto, options: { includeInactive?: boolean } = {}): Promise<RegionPaginatedAllocationResponseDto> {
        // Ensure data is synced


        const page = Number(filters.page) || 1;
        const limit = Number(filters.limit) || 10;
        const skip = (page - 1) * limit;

        // Build where clause for users based on filters
        const userWhere: any = {};

        if (filters.role) {
            userWhere.role = filters.role;
        } else {
            // If no role filter, get all assignable roles
            userWhere.role = {
                in: Object.values(ManagerRole)
            };
        }

        if (filters.search) {
            userWhere.OR = [
                { firstName: { contains: filters.search, mode: 'insensitive' } },
                { lastName: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        // Build where clause for regions
        const regionWhere: any = {};
        if (!options.includeInactive) {
            regionWhere.active = true;
        }
        if (filters.regionId) {
            regionWhere.id = filters.regionId;
        }

        if (filters.continent || filters.country || filters.state || filters.city) {
            regionWhere.location = {};
            if (filters.continent) regionWhere.location.continent = { contains: filters.continent, mode: 'insensitive' };
            if (filters.country) regionWhere.location.country = { contains: filters.country, mode: 'insensitive' };
            if (filters.state) regionWhere.location.state = { contains: filters.state, mode: 'insensitive' };
            if (filters.city) regionWhere.location.city = { contains: filters.city, mode: 'insensitive' };
        }

        // Fetch regions with assigned users and total count
        const [regions, total] = await Promise.all([
            (this.prisma.region as any).findMany({
                where: regionWhere,
                include: {
                    location: true,
                    managers: {
                        where: userWhere,
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            role: true,
                            status: true,
                        },
                    },
                },
                orderBy: {
                    name: 'asc',
                },
                skip,
                take: limit,
            }),
            (this.prisma.region as any).count({
                where: regionWhere,
            }),
        ]);

        return {
            data: regions.map(region => ({
                id: region.id,
                name: region.name,
                code: region.code,
                active: region.active,
                continent: region.location?.continent || '',
                country: region.location?.country || '',
                state: region.location?.state || '',
                city: region.location?.city || '',
                assignedUsers: region.managers,
            })),
            total,
        };
    }

    /**
     * Assign a user to one or more regions
     */
    async assignUserToRegions(dto: AssignRegionDto): Promise<any> {
        // Verify user exists
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
            include: { regions: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Verify all regions exist
        const regions = await this.prisma.region.findMany({
            where: {
                id: { in: dto.regionIds },
            },
        });

        if (regions.length !== dto.regionIds.length) {
            throw new BadRequestException('One or more regions are invalid');
        }

        // Update user's regions (this will replace existing assignments)
        const updatedUser = await this.prisma.user.update({
            where: { id: dto.userId },
            data: {
                regions: {
                    connect: dto.regionIds.map(id => ({ id })),
                },
            },
            include: {
                regions: true,
            },
        });

        // Local mapping only

        return updatedUser;
    }

    /**
     * Update user's region assignments
     */
    async updateAssignment(userId: string, dto: UpdateRegionAssignmentDto): Promise<any> {
        // Verify user exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { regions: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Verify all regions exist
        const regions = await this.prisma.region.findMany({
            where: {
                id: { in: dto.regionIds },
            },
        });

        if (regions.length !== dto.regionIds.length) {
            throw new BadRequestException('One or more regions are invalid');
        }

        // Disconnect all current regions first, then connect new ones
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                regions: {
                    set: dto.regionIds.map(id => ({ id })),
                },
            },
            include: {
                regions: true,
            },
        });

        // Local mapping only

        return updatedUser;
    }

    /**
     * Remove a user from a specific region
     */
    async removeAssignment(userId: string, regionId: string): Promise<any> {
        // Verify user exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { regions: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Verify region exists in user's assignments
        const hasRegion = user.regions.some(r => r.id === regionId);
        if (!hasRegion) {
            throw new BadRequestException('User is not assigned to this region');
        }

        // Disconnect the region
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                regions: {
                    disconnect: { id: regionId },
                },
            },
            include: {
                regions: true,
            },
        });

        // Local mapping only

        return updatedUser;
    }

    /**
     * Search users by name or email, filtered by role
     */
    async searchUsers(query: string, role?: ManagerRole): Promise<any[]> {
        const where: any = {
            OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
            ],
        };

        if (role) {
            where.role = role;
        } else {
            where.role = {
                in: Object.values(ManagerRole)
            };
        }

        const users = await this.prisma.user.findMany({
            where,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                role: true,
                status: true,
            },
            take: 20, // Limit results for search
            orderBy: {
                firstName: 'asc',
            },
        });

        return users;
    }
}
