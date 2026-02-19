import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UsersService } from '../../users/users.service';
import { UpdateCentralAuthorityProfileDto, CreateCentralAuthorityUserDto, CentralAuthorityUserDto } from './central-authority.dto';

@Injectable()
export class CentralAuthorityService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
    ) { }

    async getProfile(userId: string) {
        const profile = await this.prisma.centralAuthorityProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new NotFoundException('Central Authority profile not found');
        }
        return profile;
    }

    async upsertProfile(userId: string, dto: UpdateCentralAuthorityProfileDto) {
        return this.prisma.centralAuthorityProfile.upsert({
            where: { userId },
            update: {
                department: dto.department,
                accessLevel: dto.accessLevel,
            },
            create: {
                userId,
                department: dto.department,
                accessLevel: dto.accessLevel,
            },
        });
    }

    async create(dto: CreateCentralAuthorityUserDto) {
        // 1. Create in Database
        const user = await this.prisma.user.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                phone: dto.phone,
                role: 'central-authority',
                passwordHash: await this.usersService['hashPassword']('password'), // Or generate temporary
                status: 'active',
            },
        });

        return user;
    }

    async findAll(page: number = 1, limit: number = 10, role: string = 'central-authority'): Promise<{ data: CentralAuthorityUserDto[], total: number }> {
        const skip = (page - 1) * limit;

        const where: any = { role };
        const include: any = {};

        if (role === 'influencer') {
            include.influencerProfile = true;
        }

        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include: Object.keys(include).length > 0 ? include : undefined,
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.user.count({
                where
            })
        ]);
        return { data: data as any, total };
    }

    async getDashboardStats() {
        const [
            totalRegions,
            totalPostalCodes,
            propertyStats,
            userStats,
            recentRegions
        ] = await Promise.all([
            Promise.resolve(0), // Removed totalRegions
            this.prisma.postalCode.count(),
            this.prisma.property.groupBy({
                by: ['status'],
                _count: {
                    _all: true
                }
            }),
            this.prisma.user.groupBy({
                by: ['role'],
                _count: {
                    _all: true
                }
            }),
            [] // Removed recentRegions
        ]);

        // Process property stats
        const properties = {
            total: propertyStats.reduce((sum, item) => sum + item._count._all, 0),
            active: propertyStats.find(i => i.status === 'AVAILABLE' || i.status === 'PUBLISHED' || i.status === 'APPROVED')?._count._all || 0,
            pending: propertyStats.find(i => i.status === 'SUBMITTED')?._count._all || 0
        };

        // Process user stats
        const users = {
            total: userStats.reduce((sum, item) => sum + item._count._all, 0),
            partners: userStats.find(i => i.role === 'property-partner')?._count._all || 0,
            consultants: userStats.find(i => i.role === 'consultant')?._count._all || 0,
            channelPartners: userStats.find(i => i.role === 'dsa')?._count._all || 0
        };

        // Simplified recent activity (replace with actual audit logs if available later)
        const recentActivity = [
            { id: '1', type: 'info', action: 'System Sync', target: 'Keycloak & Mattermost', timestamp: new Date() }
        ];

        return {
            totalRegions: 0, // Placeholder

            totalPostalCodes,
            properties,
            users,
            leads: { monthly: 0 }, // Placeholder for now
            regions: [],

            recentActivity
        };
    }
}
