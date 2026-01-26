import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateMarketingLeadProfileDto } from './marketing-leads.dto';

@Injectable()
export class MarketingLeadsService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const profile = await this.prisma.marketingLeadProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new NotFoundException('Marketing Lead profile not found');
        }
        return profile;
    }

    async upsertProfile(userId: string, dto: UpdateMarketingLeadProfileDto) {
        return this.prisma.marketingLeadProfile.upsert({
            where: { userId },
            update: {
                specialization: dto.specialization,
            },
            create: {
                userId,
                specialization: dto.specialization,
            },
        });
    }
}
