import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InvitationService } from '../users/invitation.service';
import { CreateGlobalUserDto, GlobalUserDto } from './global-users.dto';

@Injectable()
export class GlobalUsersService {
    constructor(
        private prisma: PrismaService,
        private invitationService: InvitationService,
    ) { }

    async create(dto: CreateGlobalUserDto) {
        // 1. Invite user in Keycloak
        const invitation = await this.invitationService.inviteCentralAuthorityUser({
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
        });

        // 2. Create in Database
        const globalUser = await this.prisma.user.create({
            data: {
                keycloakId: invitation.userId,
                name: `${dto.firstName} ${dto.lastName}`.trim(),
                email: dto.email,
                phone: dto.phone,
                role: 'central-authority', // Default role for now
            },
        });

        return globalUser;
    }

    async findAll(): Promise<GlobalUserDto[]> {
        const users = await this.prisma.user.findMany({
            where: {
                role: 'central-authority',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return users as any;
    }
}
