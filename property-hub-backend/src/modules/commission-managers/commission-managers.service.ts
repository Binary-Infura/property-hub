import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InvitationService } from '../users/invitation.service';
import { CreateCommissionManagerDto, CommissionManagerDto } from './commission-managers.dto';

@Injectable()
export class CommissionManagersService {
    constructor(
        private prisma: PrismaService,
        private invitationService: InvitationService,
    ) { }

    async create(dto: CreateCommissionManagerDto) {
        // 1. Invite user in Keycloak
        const invitation = await this.invitationService.inviteUser({
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            regions: {}, // No regions for Commission Manager
            role: 'commission-manager',
        });

        // 2. Create in Database
        const commissionManager = await this.prisma.user.create({
            data: {
                keycloakId: invitation.userId,
                name: `${dto.firstName} ${dto.lastName}`,
                email: dto.email,
                phone: dto.phone,
                role: 'commission-manager',
            },
        });

        return commissionManager;
    }

    async findAll(): Promise<CommissionManagerDto[]> {
        const users = await this.prisma.user.findMany({
            where: {
                role: 'commission-manager',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return users as any;
    }
}
