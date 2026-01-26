import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateCreativeExecutiveProfileDto } from './creative-executives.dto';

@Injectable()
export class CreativeExecutivesService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const profile = await this.prisma.creativeExecutiveProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new NotFoundException('Creative Executive profile not found');
        }
        return profile;
    }

    async upsertProfile(userId: string, dto: UpdateCreativeExecutiveProfileDto) {
        return this.prisma.creativeExecutiveProfile.upsert({
            where: { userId },
            update: {
                portfolioUrl: dto.portfolioUrl,
            },
            create: {
                userId,
                portfolioUrl: dto.portfolioUrl,
            },
        });
    }
}
