import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { PrismaService } from '../../../database/prisma.service';
import { UsersService } from '../../users/users.service';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';
import { UpdateCentralAuthorityProfileDto, CreateCentralAuthorityUserDto, CentralAuthorityUserDto } from './central-authority.dto';
import { UserRole } from '../../../common/enums/role.enum';

@Injectable()
export class CentralAuthorityService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
        private activityLogsService: ActivityLogsService,
    ) { }

    /**
     * CENTRAL_AUTHORITY has no separate profile table.
     * Profile data (department, accessLevel) is stored in User.profileData JSON.
     */
    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, profileData: true, roles: true, primaryRole: true },
        });
        if (!user) throw new NotFoundException('Central Authority user not found');
        return user.profileData;
    }

    async upsertProfile(userId: string, dto: UpdateCentralAuthorityProfileDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const existing = (user.profileData as Record<string, any>) || {};
        const merged = {
            ...existing,
            ...(dto.department ? { department: dto.department } : {}),
            ...(dto.accessLevel ? { accessLevel: dto.accessLevel } : {}),
        };

        return this.prisma.user.update({
            where: { id: userId },
            data: { profileData: merged },
            select: { id: true, profileData: true },
        });
    }

    async create(currentUser: AuthenticatedUser, dto: CreateCentralAuthorityUserDto) {
        return this.usersService.createUser({
            ...dto,
            roles: [UserRole.CENTRAL_AUTHORITY],
        }, currentUser);
    }

    async findAll(page: number = 1, limit: number = 10, role: string = 'CENTRAL_AUTHORITY'): Promise<{ data: CentralAuthorityUserDto[], total: number }> {
        const skip = (page - 1) * limit;
        const normalizedRole = role as UserRole;
        const where: any = { roles: { has: normalizedRole } };

        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.user.count({ where })
        ]);
        return { data: data as any, total };
    }

    async getDashboardStats() {
        const [totalPostalCodes, projectStats, userStats] = await Promise.all([
            this.prisma.postalCode.count(),
            this.prisma.project.groupBy({ by: ['status'], _count: { _all: true } }),
            this.prisma.user.findMany({ select: { roles: true } }),
        ]);

        const projects = {
            total: projectStats?.reduce((sum, item) => sum + item._count._all, 0) || 0,
            active: projectStats?.find(i => ['AVAILABLE', 'PUBLISHED', 'APPROVED'].includes(i.status))?._count._all || 0,
            pending: projectStats?.find(i => i.status === 'SUBMITTED')?._count._all || 0
        };

        const userRolesFlattened = userStats.flatMap(u => u.roles);
        const users = {
            total: userStats.length,
            partners: userRolesFlattened.filter(r => r === UserRole.PROPERTY_PARTNER).length,
            consultants: userRolesFlattened.filter(r => r === UserRole.CONSULTANT).length,
            brokers: userRolesFlattened.filter(r => r === UserRole.BROKER).length,
        };

        const recentActivity = await this.prisma.activityLog.findMany({
            take: 5,
            orderBy: { timestamp: 'desc' },
            select: { id: true, type: true, action: true, target: true, timestamp: true }
        });

        return { totalPostalCodes, projects, users, leads: { monthly: 0 }, regions: [], recentActivity };
    }

    async getAllPropertyPartners() {
        return this.prisma.user.findMany({
            where: { roles: { has: UserRole.PROPERTY_PARTNER } },
            include: { organization: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getAllBrokers() {
        return this.prisma.user.findMany({
            where: { roles: { has: UserRole.BROKER } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updatePartnerSubscription(currentUser: AuthenticatedUser, targetUserId: string, isPremium: boolean, subscriptionMode: 'PAID' | 'FREE') {
        const user = await this.prisma.user.findUnique({
            where: { id: targetUserId },
            include: { organization: true },
        });

        if (!user || !user.roles.includes(UserRole.PROPERTY_PARTNER)) {
            throw new NotFoundException('Property Partner not found');
        }

        const internalCurrentUser = await this.usersService.ensureUserSynced(currentUser);

        let result: any;
        if (user.organizationId) {
            result = await this.prisma.organization.update({
                where: { id: user.organizationId },
                data: { isPremium, subscriptionMode },
            });
        } else {
            // Create org if partner doesn't have one yet
            const org = await this.prisma.organization.create({
                data: {
                    name: user.firstName + ' ' + (user.lastName || ''),
                    type: 'BUILDER',
                    isPremium,
                    subscriptionMode,
                },
            });
            await this.prisma.user.update({ where: { id: targetUserId }, data: { organizationId: org.id } });
            result = org;
        }

        await this.activityLogsService.log({
            userId: internalCurrentUser.id,
            type: isPremium ? 'info' : 'warning',
            action: isPremium ? 'Premium Subscription Granted' : 'Premium Subscription Revoked',
            target: `${user.firstName} ${user.lastName || ''}`,
            details: { mode: subscriptionMode, targetUserId }
        });

        return result;
    }
}
