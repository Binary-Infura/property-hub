import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdatePropertyPartnerProfileDto } from './property-partners.dto';

@Injectable()
export class PropertyPartnersService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const profile = await this.prisma.propertyPartnerProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new NotFoundException('Project Partner profile not found');
        }
        return profile;
    }

    async upsertProfile(userId: string, dto: UpdatePropertyPartnerProfileDto) {
        return this.prisma.propertyPartnerProfile.upsert({
            where: { userId },
            update: {
                companyName: dto.companyName,
                companyAddress: dto.companyAddress,
                taxId: dto.taxId,
                licenseNumber: dto.licenseNumber,
            },
            create: {
                userId,
                companyName: dto.companyName || 'Unknown Company',
                companyAddress: dto.companyAddress,
                taxId: dto.taxId,
                licenseNumber: dto.licenseNumber,
            },
        });
    }
}
