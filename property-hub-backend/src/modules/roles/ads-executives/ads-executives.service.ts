import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateAdsExecutiveProfileDto } from './ads-executives.dto';

@Injectable()
export class AdsExecutivesService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const profile = await this.prisma.adsExecutiveProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new NotFoundException('Ads Executive profile not found');
        }
        return profile;
    }

    async upsertProfile(userId: string, dto: UpdateAdsExecutiveProfileDto) {
        return this.prisma.adsExecutiveProfile.upsert({
            where: { userId },
            update: {
                platformSpecialty: dto.platformSpecialty,
            },
            create: {
                userId,
                platformSpecialty: dto.platformSpecialty,
            },
        });
    }
}
