import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UsersService } from '../../users/users.service';
import { CreateRegionalManagerDto, RegionalManagerDto, UpdateRegionalManagerProfileDto } from './regional-managers.dto';

@Injectable()
export class RegionalManagersService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
    ) { }

    async create(dto: CreateRegionalManagerDto) {
        // 1. Validate regions exist if provided
        let regions: any[] = [];
        if (dto.regionIds && dto.regionIds.length > 0) {
            regions = await this.prisma.region.findMany({
                where: {
                    id: { in: dto.regionIds },
                },
            });

            if (regions.length !== dto.regionIds.length) {
                throw new BadRequestException('One or more regions are invalid');
            }
        }

        // 2. Prepare regions for Keycloak invitation
        const regionRoles: { [key: string]: { roles: string[] } } = {};
        for (const region of regions) {
            regionRoles[region.code] = { roles: ['regional-manager'] };
        }

        // 3. Invite user in Keycloak
        const invitation = await this.usersService.inviteUser({
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            regions: regionRoles as any,
            role: 'regional-manager',
        });

        // 4. Create in Database
        const regionalManagerData: any = {
            keycloakId: invitation.userId,
            name: `${dto.firstName} ${dto.lastName}`,
            email: dto.email,
            phone: dto.phone,
        };

        if (dto.regionIds && dto.regionIds.length > 0) {
            regionalManagerData.regions = {
                connect: dto.regionIds.map((id) => ({ id })),
            };
        }

        const regionalManager = await this.prisma.user.create({
            data: {
                ...regionalManagerData,
                role: 'regional-manager',
            },
            include: {
                regions: true,
            },
        });

        return regionalManager;
    }

    async findAll(): Promise<RegionalManagerDto[]> {
        const managers = await this.prisma.user.findMany({
            where: {
                role: 'regional-manager',
            },
            include: {
                regions: {
                    include: {
                        _count: {
                            select: {
                                properties: true,
                                leads: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Transform to DTO with aggregated stats
        return managers.map((manager) => {
            const stats = {
                propertiesCount: 0,
                leadsCount: 0,
            };

            manager.regions.forEach((region) => {
                stats.propertiesCount += region._count.properties;
                stats.leadsCount += region._count.leads;
            });

            return {
                ...manager,
                regions: manager.regions.map(r => ({
                    ...r,
                    // remove _count from individual region if not needed in DTO or keep it
                })),
                stats,
            };
        });
    }

    async getProfile(userId: string) {
        const profile = await this.prisma.regionalManagerProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new BadRequestException('Regional Manager profile not found');
        }
        return profile;
    }

    async upsertProfile(userId: string, dto: any) {
        return this.prisma.regionalManagerProfile.upsert({
            where: { userId },
            update: {
                territory: dto.territory,
                kpiTargets: dto.kpiTargets,
            },
            create: {
                userId,
                territory: dto.territory,
                kpiTargets: dto.kpiTargets,
            },
        });
    }
}
