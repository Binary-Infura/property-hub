import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateDsaProfileDto } from './dsa.dto';

@Injectable()
export class DsaService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const profile = await this.prisma.dsaProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new NotFoundException('DSA profile not found');
        }
        return profile;
    }

    async upsertProfile(userId: string, dto: UpdateDsaProfileDto) {
        return this.prisma.dsaProfile.upsert({
            where: { userId },
            update: {
                agencyBusinessName: dto.agencyBusinessName,
                reraNumber: dto.reraNumber,
                officeAddress: dto.officeAddress,
            },
            create: {
                userId,
                agencyBusinessName: dto.agencyBusinessName || 'Unknown Agency',
                reraNumber: dto.reraNumber,
                officeAddress: dto.officeAddress,
            },
        });
    }
}
