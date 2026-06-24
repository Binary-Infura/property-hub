import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrganizationType } from '../../common/enums/organization-type.enum';
import { UserRole } from '../../common/enums/role.enum';

@Injectable()
export class OrganizationsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(type?: OrganizationType) {
        return this.prisma.organization.findMany({
            where: type ? { type: type as any } : {},
            orderBy: { name: 'asc' },
        });
    }

    async findMembers(orgId: string, role?: UserRole) {
        return this.prisma.user.findMany({
            where: {
                organizationId: orgId,
                roles: role ? { has: role as any } : undefined,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            },
            orderBy: { firstName: 'asc' },
        });
    }
}
