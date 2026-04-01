import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UsersService } from '../../users/users.service';
import { CreateGrowthPartnerDto, GrowthPartnerDto } from './growth-partners.dto';
import { UserRole } from '../../../common/enums/role.enum';

@Injectable()
export class GrowthPartnersService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
    ) { }

    async create(dto: CreateGrowthPartnerDto) {
        return this.prisma.user.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                phone: dto.phone,
                roles: [UserRole.GROWTH_PARTNER],
                activeRole: UserRole.GROWTH_PARTNER,
                passwordHash: await this.usersService['hashPassword']('password'),
                // Store campaignBudgetLimit in profileData JSON if provided
                profileData: dto.campaignBudgetLimit ? { campaignBudgetLimit: dto.campaignBudgetLimit } : {},
            },
        });
    }

    async findAll(page: number = 1, limit: number = 10): Promise<{ data: GrowthPartnerDto[], total: number }> {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where: { roles: { has: UserRole.GROWTH_PARTNER } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.user.count({ where: { roles: { has: UserRole.GROWTH_PARTNER } } })
        ]);
        return { data: data as any, total };
    }

    /**
     * Profile data is stored in User.profileData JSON.
     * No separate GrowthPartnerProfile table.
     */
    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, profileData: true },
        });
        return user?.profileData ?? null;
    }

    async upsertProfile(userId: string, data: { campaignBudgetLimit?: number }) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const existing = (user?.profileData as Record<string, any>) || {};
        return this.prisma.user.update({
            where: { id: userId },
            data: { profileData: { ...existing, ...data } },
            select: { id: true, profileData: true },
        });
    }
}
