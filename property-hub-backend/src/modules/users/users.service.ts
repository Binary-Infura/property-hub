import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserMetadataDto, CreateUserDto, UpdateUserDto, InviteUserDto, InviteCentralAuthorityDto, InvitationResponse } from './users.dto';
import { UserMetadata, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { KeycloakAdminService } from '../../common/services/keycloak/keycloak-admin.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private keycloakAdmin: KeycloakAdminService
    ) { }

    private async getClient() {
        return this.keycloakAdmin.getClient();
    }

    private get realm() {
        return this.keycloakAdmin.getRealmName();
    }

    private generateTemporaryPassword(): string {
        return "password";
    }

    /**
     * Invite a user with region-specific roles
     */
    async inviteUser(dto: InviteUserDto): Promise<InvitationResponse> {
        try {
            const client = await this.getClient();
            const temporaryPassword = this.generateTemporaryPassword();
            const username = dto.email; // Use email as username to avoid collisions

            // Check if user already exists
            const existingUsers = await client.users.find({ realm: this.realm, email: dto.email });
            if (existingUsers.length > 0) {
                throw new BadRequestException('User with this email already exists');
            }

            // Create user in Keycloak
            const createdUser = await client.users.create({
                realm: this.realm,
                username,
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
                enabled: true,
                emailVerified: false,
                credentials: [
                    {
                        type: 'password',
                        value: temporaryPassword,
                        temporary: false, // Set to false to avoid "Account is not fully set up" errors in headless login
                    },
                ],
                attributes: {},
            });

            const userId = createdUser.id;

            // Add to region groups
            const regionCodes = Object.keys(dto.regions || {});
            for (const code of regionCodes) {
                await this.keycloakAdmin.addUserToRegionGroup(dto.email, code);
            }

            const roleName = dto.role;
            if (!roleName) {
                console.log(`No role provided for user ${dto.email}, skipping realm role mapping.`);
                return {
                    userId,
                    email: dto.email,
                    temporaryPassword,
                };
            }

            const realmRole = await this.keycloakAdmin.ensureRoleExists(roleName);

            if (!realmRole) {
                throw new InternalServerErrorException(`Failed to retrieve or create role '${roleName}'`);
            }

            // Assign realm role to user
            await client.users.addRealmRoleMappings({
                realm: this.realm,
                id: userId,
                roles: [
                    {
                        id: realmRole.id,
                        name: realmRole.name,
                    },
                ],
            });

            return {
                userId,
                email: dto.email,
                temporaryPassword,
            };
        } catch (error: any) {
            console.error('Error inviting user:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            const errorMessage = error.response?.data?.errorMessage || error.message || 'Failed to invite user';
            throw new InternalServerErrorException(errorMessage);
        }
    }

    /**
     * Invite a central authority user
     */
    async inviteCentralAuthorityUser(dto: InviteCentralAuthorityDto): Promise<InvitationResponse> {
        try {
            const client = await this.getClient();
            const temporaryPassword = this.generateTemporaryPassword();
            const username = dto.email.split('@')[0];

            // Create user in Keycloak
            const createdUser = await client.users.create({
                realm: this.realm,
                username,
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
                enabled: true,
                emailVerified: false,
                credentials: [
                    {
                        type: 'password',
                        value: temporaryPassword,
                        temporary: false,
                    },
                ],
                attributes: {},
            });

            const userId = createdUser.id;

            // Assign realm role to user
            const realmRole = await this.keycloakAdmin.ensureRoleExists('central-authority');

            if (realmRole) {
                await client.users.addRealmRoleMappings({
                    realm: this.realm,
                    id: userId,
                    roles: [
                        {
                            id: realmRole.id,
                            name: realmRole.name,
                        },
                    ],
                });
            }

            return {
                userId,
                email: dto.email,
                temporaryPassword,
            };

        } catch (error: any) {
            console.error('Error inviting central authority user:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            const errorMessage = error.responseData?.errorMessage || error.message || 'Failed to invite central authority user';

            if (errorMessage.includes('User exists')) {
                throw new BadRequestException('A user with this email already exists');
            }

            throw new InternalServerErrorException(errorMessage);
        }
    }

    // --- User Metadata Methods (Current User) ---

    async findOrCreateUserMetadata(keycloakId: string): Promise<UserMetadata> {
        let userMetadata = await this.prisma.userMetadata.findUnique({
            where: { keycloakId },
        });

        if (!userMetadata) {
            userMetadata = await this.prisma.userMetadata.create({
                data: { keycloakId },
            });
        }

        return userMetadata;
    }

    async updateUserMetadata(
        keycloakId: string,
        updateUserMetadataDto: UpdateUserMetadataDto,
    ): Promise<UserMetadata> {
        await this.findOrCreateUserMetadata(keycloakId);

        return this.prisma.userMetadata.update({
            where: { keycloakId },
            data: updateUserMetadataDto,
        });
    }

    async getUserMetadata(keycloakId: string): Promise<UserMetadata> {
        return this.findOrCreateUserMetadata(keycloakId);
    }

    // --- User Management Methods (Admin/Manager) ---

    async createUser(dto: CreateUserDto): Promise<User> {
        // 1. Validate regions if provided
        if (dto.regionIds && dto.regionIds.length > 0) {
            const count = await this.prisma.region.count({
                where: { id: { in: dto.regionIds } }
            });
            if (count !== dto.regionIds.length) {
                throw new BadRequestException('One or more regions are invalid');
            }
        }

        // 2. Prepare for Keycloak
        const nameParts = dto.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || 'User';

        // Get region codes for group mapping
        const regions = dto.regionIds ? await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } }
        }) : [];

        const regionRoles: any = {};
        regions.forEach(r => {
            regionRoles[r.code] = { roles: [dto.role] };
        });

        // 3. Invite in Keycloak
        const invitation = await this.inviteUser({
            email: dto.email,
            firstName,
            lastName,
            regions: regionRoles,
            role: dto.role
        });

        // 4. Save in Local DB
        return this.prisma.user.create({
            data: {
                keycloakId: invitation.userId,
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                role: dto.role,
                agencyName: dto.agencyName,
                reraId: dto.reraId,
                rating: dto.rating,
                regions: dto.regionIds ? {
                    connect: dto.regionIds.map(id => ({ id }))
                } : undefined
            },
            include: {
                regions: true
            }
        });
    }

    async findAllByRole(role: string, regionSlug?: string): Promise<User[]> {
        const where: any = { role };

        if (regionSlug) {
            where.regions = {
                some: { code: regionSlug }
            };
        }

        return this.prisma.user.findMany({
            where,
            include: { regions: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { regions: true }
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
        const existingUser = await this.findOne(id);

        const data: any = {
            name: dto.name,
            phone: dto.phone,
            status: dto.status,
            agencyName: dto.agencyName,
            reraId: dto.reraId,
            rating: dto.rating
        };

        if (dto.regionIds) {
            data.regions = {
                set: dto.regionIds.map(id => ({ id }))
            };
        }

        return this.prisma.user.update({
            where: { id },
            data,
            include: { regions: true }
        });
    }

    async toggleStatus(id: string): Promise<User> {
        const user = await this.findOne(id);
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        return this.prisma.user.update({
            where: { id },
            data: { status: newStatus },
            include: { regions: true }
        });
    }

    async getProfileStatus(userId: string, roles: string[]) {
        const status: any = {};

        for (const role of roles) {
            let hasProfile = false;
            let profileData = null;

            switch (role) {
                case 'central-authority':
                    profileData = await this.prisma.centralAuthorityProfile.findUnique({ where: { userId } });
                    break;
                case 'property-partner':
                    profileData = await this.prisma.propertyPartnerProfile.findUnique({ where: { userId } });
                    break;
                case 'channel-partner':
                    profileData = await this.prisma.channelPartnerProfile.findUnique({ where: { userId } });
                    break;
                case 'regional-manager':
                    profileData = await this.prisma.regionalManagerProfile.findUnique({ where: { userId } });
                    break;
                case 'commission-manager':
                    profileData = await this.prisma.commissionManagerProfile.findUnique({ where: { userId } });
                    break;
                case 'marketing-manager':
                    profileData = await this.prisma.marketingManagerProfile.findUnique({ where: { userId } });
                    break;
                case 'marketing-lead':
                    profileData = await this.prisma.marketingLeadProfile.findUnique({ where: { userId } });
                    break;
                case 'ads-executive':
                    profileData = await this.prisma.adsExecutiveProfile.findUnique({ where: { userId } });
                    break;
                case 'creative-executive':
                    profileData = await this.prisma.creativeExecutiveProfile.findUnique({ where: { userId } });
                    break;
                case 'consultant':
                    profileData = await this.prisma.consultantProfile.findUnique({ where: { userId } });
                    break;
                case 'buyer':
                    profileData = await this.prisma.buyerProfile.findUnique({ where: { userId } });
                    break;
            }

            hasProfile = !!profileData;
            status[role] = { hasProfile, profileData };
        }

        return status;
    }
}
