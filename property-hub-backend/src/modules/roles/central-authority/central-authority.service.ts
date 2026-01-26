import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UsersService } from '../../users/users.service';
import { UpdateCentralAuthorityProfileDto, CreateCentralAuthorityUserDto, CentralAuthorityUserDto } from './central-authority.dto';

@Injectable()
export class CentralAuthorityService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
    ) { }

    async getProfile(userId: string) {
        const profile = await this.prisma.centralAuthorityProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new NotFoundException('Central Authority profile not found');
        }
        return profile;
    }

    async upsertProfile(userId: string, dto: UpdateCentralAuthorityProfileDto) {
        return this.prisma.centralAuthorityProfile.upsert({
            where: { userId },
            update: {
                department: dto.department,
                accessLevel: dto.accessLevel,
            },
            create: {
                userId,
                department: dto.department,
                accessLevel: dto.accessLevel,
            },
        });
    }

    async create(dto: CreateCentralAuthorityUserDto) {
        // 1. Invite user in Keycloak
        const invitation = await this.usersService.inviteCentralAuthorityUser({
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
                role: 'central-authority',
            },
        });

        return globalUser;
    }

    async findAll(): Promise<CentralAuthorityUserDto[]> {
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
