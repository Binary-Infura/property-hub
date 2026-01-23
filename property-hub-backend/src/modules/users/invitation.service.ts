import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { InviteInternalUserDto, InviteCentralAuthorityDto, InvitationResponse } from './invitation.dto';

/**
 * Service to handle user invitations via Keycloak Admin API
 */
@Injectable()
export class InvitationService {
    private kcAdminClient: KcAdminClient;
    private realm: string;

    constructor(private configService: ConfigService) {
        this.initializeKeycloakAdmin();
    }

    /**
     * Initialize Keycloak Admin Client
     */
    private async initializeKeycloakAdmin() {
        const keycloakRealmUrl = this.configService.get<string>('KEYCLOAK_REALM_URL');
        const baseUrl = keycloakRealmUrl.replace(/\/realms\/.*$/, '');

        // Extract realm from URL (e.g., http://localhost:8080/realms/property-hub -> property-hub)
        const realmMatch = keycloakRealmUrl.match(/\/realms\/([^\/]+)/);
        this.realm = realmMatch ? realmMatch[1] : 'property-hub';

        this.kcAdminClient = new KcAdminClient({
            baseUrl,
            realmName: 'master', // Connect to master initially for auth
        });

        // Authenticate with admin credentials
        await this.authenticate();
    }

    /**
     * Authenticate with Keycloak admin
     */
    private async authenticate() {
        try {
            await this.kcAdminClient.auth({
                username: this.configService.get<string>('KEYCLOAK_ADMIN_USER') || 'admin',
                password: this.configService.get<string>('KEYCLOAK_ADMIN_PASSWORD') || 'admin',
                grantType: 'password',
                clientId: 'admin-cli',
            });

            // Switch to the target realm
            this.kcAdminClient.setConfig({
                realmName: this.realm,
            });
        } catch (error) {
            console.error('Failed to authenticate with Keycloak admin:', error);
            throw new InternalServerErrorException('Failed to connect to Keycloak admin');
        }
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
            // Re-authenticate if needed
            await this.authenticate();

            const temporaryPassword = this.generateTemporaryPassword();
            const username = dto.email.split('@')[0]; // Use email prefix as username

            // Create user in Keycloak
            const createdUser = await this.kcAdminClient.users.create({
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
                        temporary: true, // User must change password on first login
                    },
                ],
                attributes: {
                    regions: [JSON.stringify(dto.regions)],
                },
            });

            const userId = createdUser.id;

            // Get the 'internal' role
            const internalRole = await this.kcAdminClient.roles.findOneByName({
                realm: this.realm,
                name: 'internal',
            });

            if (!internalRole) {
                throw new BadRequestException('Internal role not found in Keycloak');
            }

            // Assign 'internal' realm role to user
            await this.kcAdminClient.users.addRealmRoleMappings({
                realm: this.realm,
                id: userId,
                roles: [
                    {
                        id: internalRole.id,
                        name: internalRole.name,
                    },
                ],
            });

            // TODO: Send invitation email with temporary password
            // This would integrate with your email service

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
            // Re-authenticate if needed
            await this.authenticate();

            const temporaryPassword = this.generateTemporaryPassword();
            const username = dto.email.split('@')[0];

            // Create user in Keycloak
            const createdUser = await this.kcAdminClient.users.create({
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
                        temporary: true,
                    },
                ],
                attributes: {
                    // Central authority has 'all' region with 'central-authority' role
                    regions: [JSON.stringify({ all: { roles: ['central-authority'] } })],
                },
            });

            const userId = createdUser.id;

            // Get the 'internal' role
            const internalRole = await this.kcAdminClient.roles.findOneByName({
                realm: this.realm,
                name: 'internal',
            });

            if (!internalRole) {
                throw new BadRequestException('Internal role not found in Keycloak');
            }

            // Assign 'internal' realm role
            await this.kcAdminClient.users.addRealmRoleMappings({
                realm: this.realm,
                id: userId,
                roles: [
                    {
                        id: internalRole.id,
                        name: internalRole.name,
                    },
                ],
            });

            // TODO: Send invitation email

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
