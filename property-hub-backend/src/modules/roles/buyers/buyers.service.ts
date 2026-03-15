import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateBuyerProfileDto, RegisterBuyerDto } from './buyers.dto';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../../common/enums/role.enum';

@Injectable()
export class BuyersService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService
    ) { }

    /**
     * BUYER has no separate profile table.
     * Profile data (budgetMin, budgetMax, preferredLocations) is stored in User.profileData JSON.
     */
    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { profileData: true },
        });
        if (!user) {
            throw new NotFoundException('Buyer user not found');
        }
        return user.profileData;
    }

    async upsertProfile(userId: string, dto: UpdateBuyerProfileDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const existing = (user.profileData as Record<string, any>) || {};
        const merged = {
            ...existing,
            ...(dto.budgetMin !== undefined ? { budgetMin: dto.budgetMin } : {}),
            ...(dto.budgetMax !== undefined ? { budgetMax: dto.budgetMax } : {}),
            ...(dto.preferredLocations ? { preferredLocations: dto.preferredLocations } : {}),
        };

        return this.prisma.user.update({
            where: { id: userId },
            data: { profileData: merged },
            select: { id: true, profileData: true },
        });
    }

    async register(dto: RegisterBuyerDto) {
        // 1. Parse budget string (e.g. "20-40") into min/max numbers
        let budgetMin: number | undefined;
        let budgetMax: number | undefined;

        if (dto.budget) {
            if (dto.budget.includes('cr+')) {
                const minStr = dto.budget.replace('cr+', '');
                budgetMin = parseFloat(minStr) * 10000000;
            } else if (dto.budget.includes('cr')) {
                const parts = dto.budget.split('-');
                if (parts.length === 2) {
                    const parsePart = (part: string) => {
                        if (part.includes('cr')) {
                            return parseFloat(part.replace('cr', '')) * 10000000;
                        } else {
                            return parseFloat(part) * 100000;
                        }
                    };
                    budgetMin = parsePart(parts[0]);
                    budgetMax = parsePart(parts[1]);
                }
            } else {
                const parts = dto.budget.split('-');
                if (parts.length === 2) {
                    budgetMin = parseFloat(parts[0]) * 100000;
                    budgetMax = parseFloat(parts[1]) * 100000;
                }
            }
        }

        // 2. Create User via UsersService with typed roles
        const user = await this.usersService.createUser({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            phone: dto.phone,
            roles: [UserRole.BUYER],
            activeRole: UserRole.BUYER,
        });

        // 3. Create Buyer Profile in profileData JSON
        await this.upsertProfile(user.id, {
            budgetMin,
            budgetMax,
            preferredLocations: dto.location ? [dto.location] : []
        });

        return user;
    }
}
