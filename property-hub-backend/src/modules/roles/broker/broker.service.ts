import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateBrokerProfileDto } from './broker.dto';

@Injectable()
export class BrokerService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const profile = await this.prisma.brokerProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new NotFoundException('Broker profile not found');
        }
        return profile;
    }

    async upsertProfile(userId: string, dto: UpdateBrokerProfileDto) {
        return this.prisma.brokerProfile.upsert({
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
