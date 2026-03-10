import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdatePropertyPartnerProfileDto } from './property-partners.dto';

@Injectable()
export class PropertyPartnersService {
    constructor(private prisma: PrismaService) { }

    /**
     * Profile data for PROPERTY_PARTNER is split:
     * - Company identity (name, address, taxId, licenseNumber, Instagram, subscription)
     *   → stored on the Organization record linked via User.organizationId
     * - Individual partner preferences
     *   → stored in User.profileData JSON
     */
    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true },
        });
        if (!user) throw new NotFoundException('Property Partner not found');
        return {
            profileData: user.profileData,
            organization: user.organization,
        };
    }

    async upsertProfile(userId: string, dto: UpdatePropertyPartnerProfileDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true },
        });
        if (!user) throw new NotFoundException('Property Partner not found');

        const orgData: any = {};
        if (dto.companyName) orgData.name = dto.companyName;
        if (dto.companyAddress) orgData.address = dto.companyAddress;
        if (dto.taxId) orgData.taxId = dto.taxId;
        if (dto.licenseNumber) orgData.licenseNumber = dto.licenseNumber;

        if (user.organizationId) {
            await this.prisma.organization.update({ where: { id: user.organizationId }, data: orgData });
        } else if (Object.keys(orgData).length > 0) {
            const org = await this.prisma.organization.create({
                data: { name: dto.companyName || 'New Company', type: 'BUILDER', ...orgData },
            });
            await this.prisma.user.update({ where: { id: userId }, data: { organizationId: org.id } });
        }

        return this.getProfile(userId);
    }
}
