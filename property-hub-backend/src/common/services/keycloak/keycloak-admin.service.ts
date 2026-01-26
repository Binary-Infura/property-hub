import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KcAdminClient from '@keycloak/keycloak-admin-client';

@Injectable()
export class KeycloakAdminService implements OnModuleInit {
    private kcAdminClient: KcAdminClient;
    private realm: string;

    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        try {
            await this.initializeKeycloakAdmin();
            // Fix for central authority user to avoid "Account is not fully set up"
            await this.ensurePermanentPassword('central@propertyhub.com', 'password');
        } catch (error) {
            console.warn('Keycloak Admin Service failed to initialize on start. It will retry on next request.', error.message);
        }
    }

    private async initializeKeycloakAdmin() {
        const keycloakRealmUrl = this.configService.get<string>('KEYCLOAK_REALM_URL');
        const baseUrl = keycloakRealmUrl.replace(/\/realms\/.*$/, '');

        const realmMatch = keycloakRealmUrl.match(/\/realms\/([^\/]+)/);
        this.realm = realmMatch ? realmMatch[1] : 'property-hub';

        this.kcAdminClient = new KcAdminClient({
            baseUrl,
            realmName: 'master',
        });

        await this.authenticate();
    }

    private async authenticate() {
        try {
            // CRITICAL: Always reset to 'master' for authentication if we're using admin-cli
            // This prevents state pollution from previous setConfig calls in this singleton service
            this.kcAdminClient.setConfig({
                realmName: 'master',
            });

            await this.kcAdminClient.auth({
                username: this.configService.get<string>('KEYCLOAK_ADMIN_USER') || 'admin',
                password: this.configService.get<string>('KEYCLOAK_ADMIN_PASSWORD') || 'admin',
                grantType: 'password',
                clientId: 'admin-cli',
            });

            // After successful auth, switch to the target realm for operations
            this.kcAdminClient.setConfig({
                realmName: this.realm,
            });
        } catch (error: any) {
            console.error('Failed to authenticate with Keycloak admin:', error.responseData || error.message);
            console.error('Config used:', {
                realmUrl: this.configService.get('KEYCLOAK_REALM_URL'),
                adminUser: this.configService.get('KEYCLOAK_ADMIN_USER') || 'admin (fallback)',
            });
            if (error.response) {
                console.error('Error status:', error.response.status);
            }
            // THROW DETAILED ERROR FOR DEBUGGING
            throw new InternalServerErrorException(
                `Keycloak Auth Failed: ${error.message} (Status: ${error.response?.status})`
            );
        }
    }

    /**
     * Get the underlying admin client with active session
     */
    async getClient(): Promise<KcAdminClient> {
        await this.authenticate(); // Ensure token is fresh
        return this.kcAdminClient;
    }

    getRealmName(): string {
        return this.realm;
    }

    /**
     * Create a region group in Keycloak
     * Path: /regions/:regionCode
     */
    async createRegionGroup(regionCode: string, regionName: string) {
        const client = await this.getClient();

        try {
            // 1. Ensure /regions parent group exists
            let regionsParent = (await client.groups.find({ realm: this.realm }))
                .find(g => g.name === 'regions');

            if (!regionsParent) {
                const created = await client.groups.create({
                    realm: this.realm,
                    name: 'regions',
                });
                regionsParent = await client.groups.findOne({ realm: this.realm, id: created.id });
            }

            // 2. Create the specific region subgroup
            await client.groups.createChildGroup({
                realm: this.realm,
                id: regionsParent.id,
            }, {
                name: regionCode,
                attributes: {
                    displayName: [regionName]
                }
            });

            console.log(`Successfully created Keycloak group: /regions/${regionCode}`);
        } catch (error: any) {
            // Ignore if group already exists (409)
            if (error.response?.status !== 409) {
                console.error(`Failed to create Keycloak group /regions/${regionCode}:`, error);
                throw new InternalServerErrorException(`Keycloak group creation failed for ${regionCode}`);
            }
        }
    }

    /**
     * Add a user to a specific region group
     */
    async addUserToRegionGroup(email: string, regionCode: string) {
        const client = await this.getClient();
        try {
            const users = await client.users.find({ realm: this.realm, email });
            if (users.length === 0) return;
            const user = users[0];

            // 1. Find the group
            const groups = await client.groups.find({ realm: this.realm });
            const regionsParent = groups.find(g => g.name === 'regions');
            if (!regionsParent) return;

            const regionGroup = (await client.groups.listSubGroups({
                parentId: regionsParent.id,
                realm: this.realm
            })).find(g => g.name === regionCode);

            if (!regionGroup) {
                console.warn(`Region group ${regionCode} not found in Keycloak`);
                return;
            }

            // 2. Add user to group
            await client.users.addToGroup({
                realm: this.realm,
                id: user.id,
                groupId: regionGroup.id
            });
            console.log(`Successfully added ${email} to Keycloak group: /regions/${regionCode}`);
        } catch (error) {
            console.error(`Failed to add user ${email} to region group ${regionCode}:`, error);
        }
    }

    /**
     * Remove a user from all region groups they currently belong to
     */
    async removeUserFromAllRegionGroups(email: string) {
        const client = await this.getClient();
        try {
            const users = await client.users.find({ realm: this.realm, email });
            if (users.length === 0) return;
            const user = users[0];

            const userGroups = await client.users.listGroups({
                realm: this.realm,
                id: user.id
            });

            // Find groups that are under /regions
            const groups = await client.groups.find({ realm: this.realm });
            const regionsParent = groups.find(g => g.name === 'regions');
            if (!regionsParent) return;

            const regionGroups = await client.groups.listSubGroups({
                parentId: regionsParent.id,
                realm: this.realm
            });
            const regionGroupIds = regionGroups.map(g => g.id);

            for (const group of userGroups) {
                if (regionGroupIds.includes(group.id)) {
                    await client.users.delFromGroup({
                        realm: this.realm,
                        id: user.id,
                        groupId: group.id
                    });
                }
            }
        } catch (error) {
            console.error(`Failed to remove user ${email} from region groups:`, error);
        }
    }

    /**
     * Ensure a user has a permanent password
     */
    async ensurePermanentPassword(email: string, password: string) {
        const client = await this.getClient();
        try {
            const users = await client.users.find({ realm: this.realm, email });
            if (users.length === 0) return;

            const user = users[0];
            await client.users.resetPassword({
                realm: this.realm,
                id: user.id,
                credential: {
                    type: 'password',
                    value: password,
                    temporary: false
                }
            });
            console.log(`Successfully ensured permanent password for: ${email}`);
        } catch (error) {
            console.error(`Failed to reset password for ${email}:`, error);
        }
    }

    /**
     * Ensure a realm role exists, create it if not
     */
    async ensureRoleExists(roleName: string) {
        const client = await this.getClient();
        try {
            const role = await client.roles.findOneByName({
                realm: this.realm,
                name: roleName,
            });

            if (role) return role;

            console.log(`Role '${roleName}' not found in Keycloak. Creating it...`);
            await client.roles.create({
                realm: this.realm,
                name: roleName,
            });

            return await client.roles.findOneByName({
                realm: this.realm,
                name: roleName,
            });
        } catch (error) {
            console.error(`Failed to ensure role ${roleName} exists:`, error);
            throw new InternalServerErrorException(`Failed to ensure Keycloak role: ${roleName}`);
        }
    }
}
