import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateBuyerProfileDto } from './buyers.dto';

@Injectable()
export class BuyersService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const profile = await this.prisma.buyerProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new NotFoundException('Buyer profile not found');
        }
        return profile;
    }

    async upsertProfile(userId: string, dto: UpdateBuyerProfileDto) {
        return this.prisma.buyerProfile.upsert({
            where: { userId },
            update: {
                budgetMin: dto.budgetMin,
                budgetMax: dto.budgetMax,
                preferredLocations: dto.preferredLocations,
            },
            create: {
                userId,
                budgetMin: dto.budgetMin,
                budgetMax: dto.budgetMax,
                preferredLocations: dto.preferredLocations,
            },
        });
    }
}
