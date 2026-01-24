import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    GetRegionAllocationsQueryDto,
    AssignRegionDto,
    UpdateRegionAssignmentDto,
    RegionAllocationResponseDto,
    ManagerRole,
} from './region-allocations.dto';

@Injectable()
export class RegionAllocationsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get all regions with their assigned users, with optional filtering
     */
    async getAllocations(filters: GetRegionAllocationsQueryDto): Promise<RegionAllocationResponseDto[]> {
        // Build where clause for users based on filters
        const userWhere: any = {};

        if (filters.role) {
            userWhere.role = filters.role;
        } else {
            // If no role filter, get all manager roles
            userWhere.role = {
                in: [ManagerRole.REGIONAL, ManagerRole.MARKETING, ManagerRole.COMMISSION]
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
        const regions = await this.prisma.region.findMany({
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
                in: [ManagerRole.REGIONAL, ManagerRole.MARKETING, ManagerRole.COMMISSION]
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
