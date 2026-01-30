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
        // ... omitted for brevity in replace_file_content but I'll do a focused replace
        // 1. Invite user in Keycloak
        const invitation = await this.usersService.inviteUser({
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            regions: {}, // No regions for Commission Manager
            role: 'commission-manager',
        });

        // 2. Create in Database
        const commissionManager = await this.prisma.user.create({
            data: {
                keycloakId: invitation.userId,
                name: `${dto.firstName} ${dto.lastName}`,
                email: dto.email,
                phone: dto.phone,
                role: 'commission-manager',
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
