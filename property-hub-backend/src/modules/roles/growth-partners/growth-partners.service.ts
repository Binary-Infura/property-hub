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

    async findAll(query: { search?: string, platform?: string, type?: string, minBudget?: number, maxBudget?: number, page?: number, limit?: number }) {
        const { search, platform, type, minBudget, maxBudget, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            roles: { has: UserRole.GROWTH_PARTNER },
        };

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Filtering by profileData (JSON)
        // Note: Prisma JSON filters vary by DB, but here we can use basic path matches if supported or filter after fetch if needed.
        // For Postgres, we can use JSONB filters if the schema allows.
        
        const andFilters = [];
        if (platform) {
            andFilters.push({ profileData: { path: ['platforms'], array_contains: platform } });
        }
        if (type) {
            andFilters.push({ profileData: { path: ['type'], equals: type } });
        }
        
        if (andFilters.length > 0) {
            where.AND = andFilters;
        }

        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.user.count({ where })
        ]);

        // Post-fetch budget filtering if JSON filtering is tricky with ranges
        let filteredData = data;
        if (minBudget !== undefined || maxBudget !== undefined) {
            filteredData = data.filter(user => {
                const profile = (user.profileData as any) || {};
                const price = profile.startingPrice || 0;
                if (minBudget !== undefined && price < minBudget) return false;
                if (maxBudget !== undefined && price > maxBudget) return false;
                return true;
            });
        }

        return { data: filteredData as any, total: (minBudget || maxBudget) ? filteredData.length : total };
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
