import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UsersService } from '../../users/users.service';
import { CreateMarketingManagerDto, MarketingManagerDto, UpdateMarketingManagerProfileDto } from './marketing-managers.dto';

@Injectable()
export class MarketingManagersService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
    ) { }

    async create(dto: CreateMarketingManagerDto) {
        // 1. Create in Database
        const marketingManager = await this.prisma.user.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                phone: dto.phone,
                role: 'marketing-manager',
                passwordHash: await this.usersService['hashPassword']('password'),
                status: 'active',
            },
        });

        return marketingManager;
    }

    async findAll(page: number = 1, limit: number = 10): Promise<{ data: MarketingManagerDto[], total: number }> {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where: {
                    role: 'marketing-manager',
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.user.count({
                where: { role: 'marketing-manager' }
            })
        ]);
        return { data: data as any, total };
    }

    async getProfile(userId: string) {
        const profile = await this.prisma.marketingManagerProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            return null; // Return null instead of throwing if profile is missing
        }
        return profile;
    }

    async upsertProfile(userId: string, dto: UpdateMarketingManagerProfileDto) {
        return this.prisma.marketingManagerProfile.upsert({
            where: { userId },
            update: {
                campaignBudgetLimit: dto.campaignBudgetLimit,
            },
            create: {
                userId,
                campaignBudgetLimit: dto.campaignBudgetLimit,
            },
        });
    }
}
