import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    CreateRegionDto,
    UpdateRegionDto,
    GetRegionAllocationsQueryDto,
    AssignRegionDto,
    UpdateRegionAssignmentDto,
    RegionAllocationResponseDto,
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

    async findAll(): Promise<Region[]> {
        return this.prisma.region.findMany({
            orderBy: { name: 'asc' },
        });
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

    async create(createRegionDto: CreateRegionDto): Promise<Region> {
        const existing = await this.prisma.region.findUnique({
            where: { code: createRegionDto.code },
        });

        if (existing) {
            throw new ConflictException(`Region with code ${createRegionDto.code} already exists`);
        }

        const region = await this.prisma.region.create({
            data: createRegionDto,
        });

        // Sync with Keycloak: Create group /regions/:code
        await this.keycloakAdmin.createRegionGroup(region.code, region.name);

        return region;
    }

    async update(id: string, updateRegionDto: UpdateRegionDto): Promise<Region> {
        await this.findOne(id);

        return this.prisma.region.update({
            where: { id },
            data: updateRegionDto,
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
    async getAllocations(filters: GetRegionAllocationsQueryDto): Promise<RegionAllocationResponseDto[]> {
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
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        // Build where clause for regions
        const regionWhere: any = { active: true };
        if (filters.regionId) {
            regionWhere.id = filters.regionId;
        }

        // Fetch regions with assigned users
        const regions = await (this.prisma.region as any).findMany({
            where: regionWhere,
            include: {
                managers: {
                    where: userWhere,
                    select: {
                        id: true,
                        name: true,
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
        });

        return regions.map(region => ({
            id: region.id,
            name: region.name,
            code: region.code,
            active: region.active,
            assignedUsers: region.managers,
        }));
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
                { name: { contains: query, mode: 'insensitive' } },
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
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
            },
            take: 20, // Limit results for search
            orderBy: {
                name: 'asc',
            },
        });

        return users;
    }
}
