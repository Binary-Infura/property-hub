import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateBrokerProfileDto } from './broker.dto';

@Injectable()
export class BrokerService {
    constructor(private prisma: PrismaService) { }

    /**
     * BROKER has no separate profile table.
     * Profile data (agencyName, reraNumber, officeAddress) is stored in User.profileData JSON.
     */
    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { profileData: true },
        });
        if (!user) {
            throw new NotFoundException('Broker user not found');
        }
        return user.profileData;
    }

    async upsertProfile(userId: string, dto: UpdateBrokerProfileDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const existing = (user.profileData as Record<string, any>) || {};
        const merged = {
            ...existing,
            ...(dto.agencyBusinessName ? { agencyName: dto.agencyBusinessName } : {}),
            ...(dto.reraNumber ? { reraNumber: dto.reraNumber } : {}),
            ...(dto.officeAddress ? { officeAddress: dto.officeAddress } : {}),
        };

        return this.prisma.user.update({
            where: { id: userId },
            data: { profileData: merged },
            select: { id: true, profileData: true },
        });
    }
}
