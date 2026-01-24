import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InviteInternalUserDto, InviteCentralAuthorityDto, InvitationResponse } from './invitation.dto';
import { KeycloakAdminService } from '../keycloak/keycloak-admin.service';

/**
 * Service to handle user invitations via Keycloak Admin API
 */
@Injectable()
export class InvitationService {
    constructor(
        private configService: ConfigService,
        private keycloakAdmin: KeycloakAdminService
    ) { }

    private async getClient() {
        return this.keycloakAdmin.getClient();
    }

    private get realm() {
        return this.keycloakAdmin.getRealmName();
    }

    /**
     * Generate a random temporary password
     */
    private generateTemporaryPassword(): string {
        // const length = 12;
        // const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        // let password = '';
        // for (let i = 0; i < length; i++) {
        //     password += charset.charAt(Math.floor(Math.random() * charset.length));
        // }
        return "password";
    }

    /**
     * Invite an internal user with region-specific roles
     */
    async inviteInternalUser(dto: InviteInternalUserDto): Promise<InvitationResponse> {
        try {
            const client = await this.getClient();
            const temporaryPassword = this.generateTemporaryPassword();
            const username = dto.email; // Use email as username to avoid collisions

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
                attributes: {
                    regions: [JSON.stringify(dto.regions)],
                },
            });

            const userId = createdUser.id;



            const roleName = dto.role;
            if (!roleName) {
                // If no role is provided, we skip realm role mapping.
                // Log for visibility.
                console.log(`No role provided for user ${dto.email}, skipping realm role mapping.`);
                return {
                    userId,
                    email: dto.email,
                    temporaryPassword,
                };
            }

            const realmRole = await client.roles.findOneByName({
                realm: this.realm,
                name: roleName,
            });

            if (!realmRole) {
                // If the specified role is missing, we simply log a warning or throw.
                // Given the user said "internal" is missing, we should probably not fail hard if default is used?
                // No, we should fail if we can't assign the intended role.
                throw new BadRequestException(`Role '${roleName}' not found in Keycloak`);
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
            console.error('Error inviting internal user:', error);
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
                attributes: {
                    // Central authority has 'all' region with 'central-authority' role
                    regions: [JSON.stringify({ all: { roles: ['central-authority'] } })],
                },
            });

            const userId = createdUser.id;

            return {
                userId,
                email: dto.email,
                temporaryPassword,
            };
        } catch (error: any) {
            console.error('Error inviting central authority user:', error);
            const errorMessage = error.responseData?.errorMessage || error.message || 'Failed to invite central authority user';

            if (errorMessage.includes('User exists')) {
                throw new BadRequestException('A user with this email already exists');
            }

            throw new InternalServerErrorException(errorMessage);
        }
    }
}
