import { Injectable, Logger, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface MattermostUser {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
}

interface MattermostChannel {
    id: string;
    type: 'D' | 'O' | 'P'; // D = Direct Message, O = Open Channel, P = Private Channel
    name: string;
    display_name?: string;
}

interface MattermostLoginResponse {
    id: string;
    username: string;
    email: string;
    token?: string;
}

@Injectable()
export class MattermostService {
    private readonly logger = new Logger(MattermostService.name);
    private axiosInstance: AxiosInstance;
    private adminToken: string | null = null;
    private readonly mattermostUrl: string;
    private readonly teamName: string;
    private readonly adminUsername: string;
    private readonly adminPassword: string;

    constructor(private configService: ConfigService) {
        this.mattermostUrl = this.configService.get<string>('MATTERMOST_URL') || 'http://localhost:8065';
        this.teamName = this.configService.get<string>('MATTERMOST_TEAM_NAME') || 'property-hub';
        this.adminUsername = this.configService.get<string>('MATTERMOST_ADMIN_USERNAME') || 'admin';
        this.adminPassword = this.configService.get<string>('MATTERMOST_ADMIN_PASSWORD') || '';

        this.axiosInstance = axios.create({
            baseURL: `${this.mattermostUrl}/api/v4`,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Initialize admin token on service creation
        this.initializeAdminToken();
    }

    /**
     * Initialize admin token by logging in with admin credentials
     */
    private async initializeAdminToken(): Promise<void> {
        try {
            const token = await this.loginAsAdmin();
            this.adminToken = token;
            this.logger.log('Mattermost admin token initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize Mattermost admin token', error);
        }
    }

    /**
     * Login as admin and get authentication token
     */
    private async loginAsAdmin(): Promise<string> {
        try {
            const response = await this.axiosInstance.post<MattermostLoginResponse>('/users/login', {
                login_id: this.adminUsername,
                password: this.adminPassword,
            });

            const token = response.headers['token'];
            if (!token) {
                throw new UnauthorizedException('No token received from Mattermost');
            }

            return token;
        } catch (error) {
            this.logger.error('Failed to login as Mattermost admin', error);
            throw new InternalServerErrorException('Failed to authenticate with Mattermost');
        }
    }

    /**
     * Ensure we have a valid admin token
     */
    private async ensureAdminToken(): Promise<string> {
        if (!this.adminToken) {
            this.adminToken = await this.loginAsAdmin();
        }
        return this.adminToken;
    }

    /**
     * Create or get existing user in Mattermost
     */
    async createOrGetUser(email: string, username: string, firstName?: string, lastName?: string): Promise<MattermostUser> {
        try {
            const token = await this.ensureAdminToken();

            // Try to get existing user by email
            try {
                const response = await this.axiosInstance.get<MattermostUser>(`/users/email/${email}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                this.logger.log(`Found existing Mattermost user: ${email}`);
                return response.data;
            } catch (error) {
                // User doesn't exist, create new one
                this.logger.log(`Creating new Mattermost user: ${email}`);
            }

            // Create new user
            const response = await this.axiosInstance.post<MattermostUser>(
                '/users',
                {
                    email,
                    username,
                    password: this.generateRandomPassword(),
                    first_name: firstName || '',
                    last_name: lastName || '',
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Add user to team
            await this.addUserToTeam(response.data.id);

            return response.data;
        } catch (error) {
            this.logger.error(`Failed to create/get Mattermost user: ${email}`, error);
            throw new InternalServerErrorException('Failed to create Mattermost user');
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(userId: string): Promise<MattermostUser> {
        try {
            const token = await this.ensureAdminToken();
            const response = await this.axiosInstance.get<MattermostUser>(`/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get Mattermost user by ID: ${userId}`, error);
            throw new InternalServerErrorException('Failed to get Mattermost user');
        }
    }

    /**
     * Add user to the default team
     */
    private async addUserToTeam(userId: string): Promise<void> {
        try {
            const token = await this.ensureAdminToken();

            // Get team by name
            const teamResponse = await this.axiosInstance.get(`/teams/name/${this.teamName}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const teamId = teamResponse.data.id;

            // Add user to team
            await this.axiosInstance.post(
                `/teams/${teamId}/members`,
                {
                    team_id: teamId,
                    user_id: userId,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            this.logger.log(`Added user ${userId} to team ${this.teamName}`);
        } catch (error) {
            this.logger.error(`Failed to add user to team: ${userId}`, error);
            // Don't throw - user was created successfully
        }
    }

    /**
     * Create or get existing direct message channel between two users
     */
    async createOrGetDirectChannel(userId1: string, userId2: string): Promise<MattermostChannel> {
        try {
            const token = await this.ensureAdminToken();

            const response = await this.axiosInstance.post<MattermostChannel>(
                '/channels/direct',
                [userId1, userId2],
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            this.logger.log(`Created/got DM channel between ${userId1} and ${userId2}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to create DM channel`, error);
            throw new InternalServerErrorException('Failed to create direct message channel');
        }
    }

    /**
     * Get channel by ID
     */
    async getChannelById(channelId: string): Promise<MattermostChannel> {
        try {
            const token = await this.ensureAdminToken();
            const response = await this.axiosInstance.get<MattermostChannel>(`/channels/${channelId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get channel: ${channelId}`, error);
            throw new InternalServerErrorException('Failed to get channel');
        }
    }

    /**
     * Create a user session token for WebSocket connection
     */
    async createUserToken(userId: string): Promise<string> {
        try {
            const token = await this.ensureAdminToken();

            const response = await this.axiosInstance.post(
                `/users/${userId}/tokens`,
                {
                    description: 'Property Hub Chat Session',
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            return response.data.token;
        } catch (error) {
            this.logger.error(`Failed to create user token for: ${userId}`, error);
            throw new InternalServerErrorException('Failed to create user token');
        }
    }

    /**
     * Get WebSocket URL for real-time messaging
     */
    getWebSocketUrl(): string {
        return this.mattermostUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/api/v4/websocket';
    }

    /**
     * Generate random password for new Mattermost users
     */
    private generateRandomPassword(): string {
        return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
    }
}
