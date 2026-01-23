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
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }

    /**
     * Invite an internal user with region-specific roles
     */
    async inviteInternalUser(dto: InviteInternalUserDto): Promise<InvitationResponse> {
        try {
            const client = await this.getClient();
            const temporaryPassword = this.generateTemporaryPassword();
            const username = dto.email.split('@')[0]; // Use email prefix as username

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

            // Get the 'internal' role
            const internalRole = await client.roles.findOneByName({
                realm: this.realm,
                name: 'internal',
            });

            if (!internalRole) {
                throw new BadRequestException('Internal role not found in Keycloak');
            }

            // Assign 'internal' realm role to user
            await client.users.addRealmRoleMappings({
                realm: this.realm,
                id: userId,
                roles: [
                    {
                        id: internalRole.id,
                        name: internalRole.name,
                    },
                ],
            });

            return {
                userId,
                email: dto.email,
                temporaryPassword,
            };
        } catch (error) {
            console.error('Error inviting internal user:', error);
            throw new InternalServerErrorException('Failed to invite user');
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

            // Get the 'internal' role
            const internalRole = await client.roles.findOneByName({
                realm: this.realm,
                name: 'internal',
            });

            if (!internalRole) {
                throw new BadRequestException('Internal role not found in Keycloak');
            }

            // Assign 'internal' realm role
            await client.users.addRealmRoleMappings({
                realm: this.realm,
                id: userId,
                roles: [
                    {
                        id: internalRole.id,
                        name: internalRole.name,
                    },
                ],
            });

            return {
                userId,
                email: dto.email,
                temporaryPassword,
            };
        } catch (error) {
            console.error('Error inviting central authority user:', error);
            throw new InternalServerErrorException('Failed to invite central authority user');
        }
    }
}
