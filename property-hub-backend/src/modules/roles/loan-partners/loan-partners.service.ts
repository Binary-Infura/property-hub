import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateLoanPartnerProfileDto } from './loan-partners.dto';
import { OrganizationType } from '../../../common/enums/organization-type.enum';

@Injectable()
export class LoanPartnersService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true },
        });
        if (!user) throw new NotFoundException('Loan Partner not found');
        return {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            profileData: user.profileData,
            organization: user.organization,
        };
    }

    async upsertProfile(userId: string, dto: UpdateLoanPartnerProfileDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true },
        });
        if (!user) throw new NotFoundException('Loan Partner not found');

        const orgData: any = {};
        if (dto.companyName) orgData.name = dto.companyName;
        if (dto.companyAddress) orgData.address = dto.companyAddress;
        if (dto.taxId) orgData.taxId = dto.taxId;
        if (dto.licenseNumber) orgData.licenseNumber = dto.licenseNumber;

        if (user.organizationId) {
            await this.prisma.organization.update({ where: { id: user.organizationId }, data: orgData });
        } else if (Object.keys(orgData).length > 0) {
            const org = await this.prisma.organization.create({
                data: { 
                    name: dto.companyName || 'New Loan Partner Company', 
                    type: OrganizationType.LOAN_PARTNER as any, 
                    ...orgData 
                },
            });
            await this.prisma.user.update({ where: { id: userId }, data: { organizationId: org.id } });
        }

        return this.getProfile(userId);
    }
}
