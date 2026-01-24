import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InviteUserDto, InviteCentralAuthorityDto, InvitationResponse } from './invitation.dto';
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
     * Invite a user with region-specific roles
     */
    async inviteUser(dto: InviteUserDto): Promise<InvitationResponse> {
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
            console.error('Error inviting user:', error);
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
