import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { PrismaService } from '../../../database/prisma.service';
import { UsersService } from '../../users/users.service';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';
import { UpdateCentralAuthorityProfileDto, CreateCentralAuthorityUserDto, CentralAuthorityUserDto } from './central-authority.dto';
import { UserRole } from '../../../common/enums/role.enum';
import { OrganizationType } from '../../../common/enums/organization-type.enum';

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
            select: { id: true, profileData: true, roles: true, activeRole: true },
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
        const [totalRevenue, totalPostalCodes, projectStats, userStats, recentInvitations, totalOrganizations, citiesRaw] = await Promise.all([
            this.prisma.paymentOrder.aggregate({
                where: { status: 'SUCCESS' },
                _sum: { amount: true }
            }),
            this.prisma.postalCode.count(),
            this.prisma.project.groupBy({ by: ['status'], _count: { _all: true } }),
            this.prisma.user.findMany({ select: { roles: true } }),
            this.prisma.invitation.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    invitedBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                        }
                    }
                }
            }),
            this.prisma.organization.count(),
            this.prisma.city.findMany({
                include: {
                    _count: {
                        select: { projects: true }
                    }
                }
            })
        ]);

        const cities = citiesRaw.map(city => ({
            id: city.id,
            name: city.name,
            managers: [], // Not implemented yet
            propertiesCount: city._count?.projects || 0,
            leadsGenerated: 0 // Not implemented yet
        }));

        const projects = {
            total: projectStats?.reduce((sum, item) => sum + item._count._all, 0) || 0,
            active: projectStats?.find(i => ['AVAILABLE', 'APPROVED'].includes(i.status))?._count._all || 0,
            pending: projectStats?.find(i => i.status === 'SUBMITTED')?._count._all || 0
        };

        const userRolesFlattened = userStats.flatMap(u => u.roles);
        const users = {
            total: userStats.length,
            partners: userRolesFlattened.filter(r => r === UserRole.PROPERTY_PARTNER).length,
            consultants: userRolesFlattened.filter(r => r === UserRole.CONSULTANT).length,
        };

        const recentActivity = await this.prisma.activityLog.findMany({
            take: 5,
            orderBy: { timestamp: 'desc' },
            select: { id: true, type: true, action: true, target: true, timestamp: true }
        });

        return {
            totalRevenue: totalRevenue._sum.amount ? Number(totalRevenue._sum.amount) : 0,
            totalPostalCodes,
            totalOrganizations,
            projects,
            users,
            leads: { monthly: 0 },
            regions: [],
            cities,
            recentActivity,
            recentInvitations
        };
    }

    async getAllPropertyPartners() {
        const partners = await this.prisma.user.findMany({
            where: { roles: { has: UserRole.PROPERTY_PARTNER } },
            include: { 
                organization: true,
                paymentOrders: {
                    where: { status: 'SUCCESS' },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return partners.map(p => ({
            ...p,
            latestPayment: p.paymentOrders?.[0] || null
        }));
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
                    type: OrganizationType.PROPERTY_PARTNER as any,
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

    async getAllInvitations(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.invitation.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    invitedBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            }),
            this.prisma.invitation.count()
        ]);

        return { data, total, page, limit };
    }

    async getAllOrganizations() {
        return this.prisma.organization.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { members: true }
                }
            }
        });
    }
}
