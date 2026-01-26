import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateConsultantProfileDto } from './consultants.dto';

@Injectable()
export class ConsultantsService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const profile = await this.prisma.consultantProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new NotFoundException('Consultant profile not found');
        }
        return profile;
    }

    async upsertProfile(userId: string, dto: UpdateConsultantProfileDto) {
        return this.prisma.consultantProfile.upsert({
            where: { userId },
            update: {
                specialization: dto.specialization,
                experienceYears: dto.experienceYears,
            },
            create: {
                userId,
                specialization: dto.specialization,
                experienceYears: dto.experienceYears,
            },
        });
    }
}
