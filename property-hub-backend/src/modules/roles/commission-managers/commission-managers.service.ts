import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UsersService } from '../../users/users.service';
import { CreateCommissionManagerDto, CommissionManagerDto, UpdateCommissionManagerProfileDto } from './commission-managers.dto';

@Injectable()
export class CommissionManagersService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
    ) { }

    async create(dto: CreateCommissionManagerDto) {
        // 1. Create in Database
        const commissionManager = await this.prisma.user.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                phone: dto.phone,
                role: 'commission-manager',
                passwordHash: await this.usersService['hashPassword']('password'),
                status: 'active',
            },
        });

        return commissionManager;
    }

    async findAll(page: number = 1, limit: number = 10): Promise<{ data: CommissionManagerDto[], total: number }> {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where: {
                    role: 'commission-manager',
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.user.count({
                where: { role: 'commission-manager' }
            })
        ]);
        return { data: data as any, total };
    }

    async getProfile(userId: string) {
        const profile = await this.prisma.commissionManagerProfile.findUnique({
            where: { userId },
        });
        return profile;
    }

    async upsertProfile(userId: string, dto: UpdateCommissionManagerProfileDto) {
        return this.prisma.commissionManagerProfile.upsert({
            where: { userId },
            update: {
                paymentAuthorityLimit: dto.paymentAuthorityLimit,
            },
            create: {
                userId,
                paymentAuthorityLimit: dto.paymentAuthorityLimit,
            },
        });
    }
}
