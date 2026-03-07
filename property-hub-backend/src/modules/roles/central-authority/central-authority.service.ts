import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { PrismaService } from '../../../database/prisma.service';
import { UsersService } from '../../users/users.service';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';
import { UpdateCentralAuthorityProfileDto, CreateCentralAuthorityUserDto, CentralAuthorityUserDto } from './central-authority.dto';

@Injectable()
export class CentralAuthorityService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
        private activityLogsService: ActivityLogsService,
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
    async create(currentUser: AuthenticatedUser, dto: CreateCentralAuthorityUserDto) {
        return this.usersService.createUser({
            ...dto,
            roles: ['central-authority'],
        }, currentUser);
    }

    async findAll(page: number = 1, limit: number = 10, role: string = 'central-authority'): Promise<{ data: CentralAuthorityUserDto[], total: number }> {
        const skip = (page - 1) * limit;

        const where: any = { roles: { has: role } };
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
            projectStats,
            userStats,
            recentRegions
        ] = await Promise.all([
            Promise.resolve(0), // Removed totalRegions
            this.prisma.postalCode.count(),
            this.prisma.project.groupBy({
                by: ['status'],
                _count: {
                    _all: true
                }
            }),
            this.prisma.user.findMany({
                select: { roles: true }
            }),
            [] // Removed recentRegions
        ]);

        // Process project stats
        const projects = {
            total: projectStats?.reduce((sum, item) => sum + item._count._all, 0) || 0,
            active: projectStats?.find(i => i.status === 'AVAILABLE' || i.status === 'PUBLISHED' || i.status === 'APPROVED')?._count._all || 0,
            pending: projectStats?.find(i => i.status === 'SUBMITTED')?._count._all || 0
        };

        // Process user stats (Manually aggregate since roles are arrays)
        const userRolesFlattened = userStats.flatMap(u => u.roles);
        const users = {
            total: userStats.length,
            partners: userRolesFlattened.filter(r => r === 'property-partner').length,
            consultants: userRolesFlattened.filter(r => r === 'consultant').length,
            channelPartners: userRolesFlattened.filter(r => r === 'dsa').length
        };

        // Simplified recent activity (replace with actual audit logs if available later)
        const recentActivity = [
            { id: '1', type: 'info', action: 'System Sync', target: 'Keycloak & Mattermost', timestamp: new Date() }
        ];

        return {
            totalRegions: 0, // Placeholder

            totalPostalCodes,
            projects,
            users,
            leads: { monthly: 0 }, // Placeholder for now
            regions: [],

            recentActivity: (await (this.prisma as any).activityLog.findMany({
                take: 5,
                orderBy: { timestamp: 'desc' },
                select: {
                    id: true,
                    type: true,
                    action: true,
                    target: true,
                    timestamp: true
                }
            }))
        };
    }
    async getAllPropertyPartners() {
        return this.prisma.user.findMany({
            where: {
                roles: {
                    has: 'property-partner'
                }
            },
            include: {
                propertyPartnerProfile: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async getAllBrokers() {
        return this.prisma.user.findMany({
            where: {
                roles: {
                    has: 'broker'
                }
            },
            include: {
                brokerProfile: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async updatePartnerSubscription(currentUser: AuthenticatedUser, targetUserId: string, isPremium: boolean, subscriptionMode: 'PAID' | 'FREE') {
        const user = await this.prisma.user.findUnique({
            where: { id: targetUserId },
            include: { propertyPartnerProfile: true }
        });

        if (!user || !user.roles.includes('property-partner')) {
            throw new NotFoundException('Project Partner not found');
        }

        const internalCurrentUser = await this.usersService.ensureUserSynced(currentUser);

        const result = await (this.prisma.propertyPartnerProfile as any).upsert({
            where: { userId: targetUserId },
            update: {
                isPremium,
                subscriptionMode
            },
            create: {
                userId: targetUserId,
                isPremium,
                subscriptionMode,
                companyName: user.agencyName || 'Unknown Company'
            }
        });

        await this.activityLogsService.log({
            userId: internalCurrentUser.id,
            type: isPremium ? 'info' : 'warning',
            action: isPremium ? 'Premium Subscription Granted' : 'Premium Subscription Revoked',
            target: user.firstName + ' ' + (user.lastName || ''),
            details: { mode: subscriptionMode, targetUserId }
        });

        return result;
    }
}
