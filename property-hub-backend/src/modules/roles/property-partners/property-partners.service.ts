import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdatePropertyPartnerProfileDto, CreateBrokerDto } from './property-partners.dto';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../../common/enums/role.enum';
import { OrganizationType } from '../../../common/enums/organization-type.enum';

@Injectable()
export class PropertyPartnersService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService
    ) { }

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

    async getBrokers(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || user.primaryRole !== 'PROPERTY_PARTNER') {
            throw new NotFoundException('Property Partner not found');
        }

        const where: any = { roles: { has: UserRole.BROKER } };
        if (user.organizationId) {
            where.organizationId = user.organizationId;
        } else {
            // Fallback to onboardedBy if no organization link
            where.onboardedById = user.id;
        }

        return this.prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
    }

    async createBroker(userId: string, dto: CreateBrokerDto) {
        const currentUser = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!currentUser || currentUser.primaryRole !== 'PROPERTY_PARTNER') {
            throw new NotFoundException('Property Partner not found');
        }

        return this.usersService.createUser({
            ...dto,
            roles: [UserRole.BROKER],
            primaryRole: UserRole.BROKER,
            organizationId: currentUser.organizationId || undefined,
        }, { userId: currentUser.id, roles: currentUser.roles } as any);
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
                data: { name: dto.companyName || 'New Company', type: OrganizationType.PROPERTY_PARTNER as any, ...orgData },
            });
            await this.prisma.user.update({ where: { id: userId }, data: { organizationId: org.id } });
        }

        return this.getProfile(userId);
    }
}
