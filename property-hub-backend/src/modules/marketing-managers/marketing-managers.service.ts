import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InvitationService } from '../users/invitation.service';
import { CreateMarketingManagerDto, MarketingManagerDto } from './marketing-managers.dto';

@Injectable()
export class MarketingManagersService {
    constructor(
        private prisma: PrismaService,
        private invitationService: InvitationService,
    ) { }

    async create(dto: CreateMarketingManagerDto) {
        // 1. Invite user in Keycloak
        const invitation = await this.invitationService.inviteInternalUser({
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            regions: {}, // No regions for Marketing Manager
            role: 'marketing-manager',
        });

        // 2. Create in Database
        const marketingManager = await this.prisma.user.create({
            data: {
                keycloakId: invitation.userId,
                name: `${dto.firstName} ${dto.lastName}`,
                email: dto.email,
                phone: dto.phone,
                role: 'marketing-manager',
            },
        });

        return marketingManager;
    }

    async findAll(): Promise<MarketingManagerDto[]> {
        const users = await this.prisma.user.findMany({
            where: {
                role: 'marketing-manager',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return users as any;
    }
}
