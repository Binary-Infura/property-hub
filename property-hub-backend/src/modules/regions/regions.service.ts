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
import { KeycloakAdminService } from '../../common/services/keycloak/keycloak-admin.service';

@Injectable()
export class RegionsService {
    constructor(
        private prisma: PrismaService,
        private keycloakAdmin: KeycloakAdminService
    ) { }

    async findAll(query: GetAllRegionsQueryDto): Promise<{ data: Region[], total: number }> {
        // Auto-sync missing continents for legacy data
        await this.syncMissingContinents();

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = { active: true };

        if (query.continent) where.continent = { contains: query.continent, mode: 'insensitive' };
        if (query.country) where.country = { contains: query.country, mode: 'insensitive' };
        if (query.state) where.state = { contains: query.state, mode: 'insensitive' };
        if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { code: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.region.findMany({
                where,
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
        });

        if (!region) {
            throw new NotFoundException(`Region with ID ${id} not found`);
        }

        return region;
    }

    /**
     * Helper to populate missing continents for existing regions
     */
    private async syncMissingContinents() {
        try {
            const regionModel = (this.prisma as any).region;
            const regionsToFix = await regionModel.findMany({
                where: {
                    continent: null,
                    country: { not: null }
                },
                take: 100
            });

            if (regionsToFix.length === 0) return;

            for (const region of regionsToFix) {
                if (region.country) {
                    let continent = '';
                    const c = region.country.toLowerCase();
                    // Basic mapping for legacy data fix
                    if (c === 'india' || c === 'brunei' || c === 'sri lanka' || c === 'pakistan') continent = 'Asia';
                    else if (c === 'belarus' || c === 'russia' || c === 'ukraine') continent = 'Europe';
                    else if (c === 'nigeria' || c === 'egypt') continent = 'Africa';
                    else if (c === 'united states' || c === 'usa' || c === 'canada') continent = 'Americas';

                    if (continent) {
                        await regionModel.update({
                            where: { id: region.id },
                            data: { continent }
                        });
                    }
                }
            }
        } catch (e) {
            // Background sync failure is okay
        }
    }

    async create(createRegionDto: CreateRegionDto): Promise<Region> {
        let baseCode = '';

        if (createRegionDto.countryCode && createRegionDto.stateCode && createRegionDto.cityCode && createRegionDto.name) {
            const cCode = createRegionDto.countryCode.toLowerCase();
            const sCode = createRegionDto.stateCode.toLowerCase();
            const ciPrefix = createRegionDto.cityCode?.substring(0, 2).toLowerCase() || createRegionDto.city?.substring(0, 2).toLowerCase();
            const loPrefix = createRegionDto.name.substring(0, 2).toLowerCase();
            baseCode = `${cCode}-${sCode}-${ciPrefix}-${loPrefix}`;
        } else {
            baseCode = createRegionDto.code || createRegionDto.name.toLowerCase().replace(/\s+/g, '-');
        }

        // Clean base code from existing suffix -XX
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

        // De-structure to remove UI-only code fields
        const { countryCode, stateCode, cityCode, ...dbData } = createRegionDto as any;

        const region = await this.prisma.region.create({
            data: {
                ...(dbData as any),
                code: finalCode,
            },
        });

        // Sync with Keycloak: Create group /regions/:code
        await this.keycloakAdmin.createRegionGroup(region.code, region.name);

        return region;
    }

    async update(id: string, updateRegionDto: UpdateRegionDto): Promise<Region> {
        await this.findOne(id);

        // De-structure to remove UI-only code fields, but KEEP location fields (country, state, city)
        const { countryCode, stateCode, cityCode, ...dbData } = updateRegionDto as any;

        return this.prisma.region.update({
            where: { id },
            data: {
                ...(dbData as any),
            },
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
     * Sync user regions to Keycloak groups
     */
    private async syncToKeycloak(userId: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { regions: true }
            });

            if (!user) return;

            // Sync groups
            // First remove from all region groups to ensure fresh state
            await this.keycloakAdmin.removeUserFromAllRegionGroups(user.email);

            // Add to new region groups
            for (const region of user.regions) {
                await this.keycloakAdmin.addUserToRegionGroup(user.email, region.code);
            }
        } catch (error) {
            console.error(`Failed to sync user ${userId} to Keycloak:`, error);
        }
    }

    /**
     * Get all regions with their assigned users, with optional filtering
     */
    async getAllocations(filters: GetRegionAllocationsQueryDto): Promise<RegionPaginatedAllocationResponseDto> {
        // Ensure data is synced
        await this.syncMissingContinents();

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
        const regionWhere: any = { active: true };
        if (filters.regionId) {
            regionWhere.id = filters.regionId;
        }
        if (filters.continent) {
            regionWhere.continent = { contains: filters.continent, mode: 'insensitive' };
        }
        if (filters.country) {
            regionWhere.country = { contains: filters.country, mode: 'insensitive' };
        }
        if (filters.state) {
            regionWhere.state = { contains: filters.state, mode: 'insensitive' };
        }
        if (filters.city) {
            regionWhere.city = { contains: filters.city, mode: 'insensitive' };
        }

        // Fetch regions with assigned users and total count
        const [regions, total] = await Promise.all([
            (this.prisma.region as any).findMany({
                where: regionWhere,
                include: {
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
                continent: region.continent || '',
                country: region.country || '',
                state: region.state || '',
                city: region.city || '',
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

        // Sync to Keycloak
        await this.syncToKeycloak(dto.userId);

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

        // Sync to Keycloak
        await this.syncToKeycloak(userId);

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

        // Sync to Keycloak
        await this.syncToKeycloak(userId);

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
