import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateChannelPartnerProfileDto } from './channel-partners.dto';

@Injectable()
export class ChannelPartnersService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const profile = await this.prisma.channelPartnerProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new NotFoundException('Channel Partner profile not found');
        }
        return profile;
    }

    async upsertProfile(userId: string, dto: UpdateChannelPartnerProfileDto) {
        return this.prisma.channelPartnerProfile.upsert({
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
