import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import axios from 'axios';

@Injectable()
export class InstagramService {
    private instagramGraphUrl = 'https://graph.instagram.com';
    private instagramApiVersion = 'v18.0';

    constructor(private prisma: PrismaService) {}

    /**
     * Get Instagram OAuth redirect URL
     */
    getOAuthRedirectUrl(userId: string): string {
        const clientId = process.env.INSTAGRAM_APP_ID;
        const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
        const scope = 'instagram_business_basic,instagram_business_content_publish,pages_read_engagement';
        
        return `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${userId}`;
    }

    /**
     * Exchange OAuth code for access token
     */
    async exchangeCodeForToken(code: string): Promise<{ accessToken: string; userId: string }> {
        try {
            const clientId = process.env.INSTAGRAM_APP_ID;
            const clientSecret = process.env.INSTAGRAM_APP_SECRET;
            const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

            const response = await axios.post(
                'https://graph.instagram.com/v18.0/oauth/access_token',
                {
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: 'authorization_code',
                    redirect_uri: redirectUri,
                    code,
                }
            );

            return {
                accessToken: response.data.access_token,
                userId: response.data.user_id,
            };
        } catch (error: any) {
            throw new BadRequestException(`Failed to exchange code for token: ${error.message}`);
        }
    }

    /**
     * Get Instagram user info (business account)
     */
    async getInstagramUserInfo(accessToken: string): Promise<{ id: string; username: string }> {
        try {
            const response = await axios.get(
                `${this.instagramGraphUrl}/${this.instagramApiVersion}/me?fields=id,username,name&access_token=${accessToken}`
            );

            return {
                id: response.data.id,
                username: response.data.username,
            };
        } catch (error: any) {
            throw new BadRequestException(`Failed to fetch Instagram user info: ${error.message}`);
        }
    }

    /**
     * Store Instagram credentials for a property partner
     */
    async storeInstagramCredentials(
        userId: string,
        accessToken: string,
        instagramUserId: string,
        username: string
    ): Promise<void> {
        await this.prisma.propertyPartnerProfile.update({
            where: { userId },
            data: {
                instagramAccessToken: accessToken,
                instagramUserId: instagramUserId,
                instagramUsername: username,
                instagramConnectedAt: new Date(),
            },
        });
    }

    /**
     * Get Instagram credentials for a user
     */
    async getInstagramCredentials(userId: string) {
        const profile = await this.prisma.propertyPartnerProfile.findUnique({
            where: { userId },
            select: {
                instagramAccessToken: true,
                instagramUserId: true,
                instagramUsername: true,
            },
        });

        if (!profile?.instagramAccessToken) {
            throw new BadRequestException('Instagram account not connected');
        }

        return profile;
    }

    /**
     * Disconnect Instagram account
     */
    async disconnectInstagramAccount(userId: string): Promise<void> {
        await this.prisma.propertyPartnerProfile.update({
            where: { userId },
            data: {
                instagramAccessToken: null,
                instagramUserId: null,
                instagramUsername: null,
                instagramConnectedAt: null,
            },
        });
    }

    /**
     * Publish reel to partner's Instagram account
     */
    async publishReelToPartnerAccount(
        reelId: string,
        videoUrl: string,
        caption: string,
        userId: string,
    ): Promise<{ postUrl: string; mediaId: string }> {
        try {
            // Get Instagram credentials for the user
            const credentials = await this.getInstagramCredentials(userId);

            // Step 1: Create media container on Instagram
            console.log(`Creating Instagram media for reel ${reelId}...`);
            const mediaResponse = await axios.post(
                `${this.instagramGraphUrl}/${this.instagramApiVersion}/${credentials.instagramUserId}/media`,
                {
                    media_type: 'VIDEO',
                    video_url: videoUrl,
                    caption: caption,
                    access_token: credentials.instagramAccessToken,
                },
                { timeout: 30000 }
            );

            if (!mediaResponse.data?.id) {
                throw new BadRequestException('Failed to create Instagram media container');
            }

            const mediaId = mediaResponse.data.id;
            console.log(`Media container created: ${mediaId}`);

            // Step 2: Publish the media
            console.log(`Publishing media ${mediaId} to Instagram...`);
            const publishResponse = await axios.post(
                `${this.instagramGraphUrl}/${this.instagramApiVersion}/${mediaId}/publish`,
                {
                    access_token: credentials.instagramAccessToken,
                },
                { timeout: 30000 }
            );

            if (!publishResponse.data?.id) {
                throw new BadRequestException('Failed to publish Instagram media');
            }

            const postUrl = `https://instagram.com/p/${publishResponse.data.id}`;
            console.log(`Reel published successfully: ${postUrl}`);

            // Step 3: Update reel in database
            await this.prisma.reel.update({
                where: { id: reelId },
                data: {
                    instagramPostUrl: postUrl,
                    instagramStatus: 'PUBLISHED',
                },
            });

            return {
                postUrl,
                mediaId: publishResponse.data.id,
            };
        } catch (error: any) {
            console.error(`Failed to publish reel to Instagram:`, error.message);
            
            // Mark as failed in database
            await this.prisma.reel.update({
                where: { id: reelId },
                data: {
                    instagramStatus: 'FAILED',
                    officialInstagramModerationNote: `Failed to publish: ${error.message}`,
                },
            });

            throw new InternalServerErrorException(
                `Failed to publish to Instagram: ${error.response?.data?.error?.message || error.message}`
            );
        }
    }

    /**
     * Request publishing to PropertyHub official Instagram (queues for approval)
     */
    async requestOfficialInstagramPublishing(reelId: string): Promise<void> {
        await this.prisma.reel.update({
            where: { id: reelId },
            data: {
                instagramStatus: 'PENDING_APPROVAL',
            },
        });
    }

    /**
     * Approve reel for PropertyHub official Instagram publishing
     */
    async approveReelForOfficialPublishing(
        reelId: string,
        videoUrl: string,
        caption: string,
    ): Promise<{ postUrl: string; mediaId: string }> {
        try {
            const officialInstagramUserId = process.env.INSTAGRAM_OFFICIAL_USER_ID;
            const officialAccessToken = process.env.INSTAGRAM_OFFICIAL_ACCESS_TOKEN;

            if (!officialInstagramUserId || !officialAccessToken) {
                throw new BadRequestException(
                    'Official Instagram account not configured'
                );
            }

            // Step 1: Create media on official account
            console.log(`Creating media on PropertyHub official Instagram...`);
            const mediaResponse = await axios.post(
                `${this.instagramGraphUrl}/${this.instagramApiVersion}/${officialInstagramUserId}/media`,
                {
                    media_type: 'VIDEO',
                    video_url: videoUrl,
                    caption: caption,
                    access_token: officialAccessToken,
                },
                { timeout: 30000 }
            );

            if (!mediaResponse.data?.id) {
                throw new BadRequestException('Failed to create media on official account');
            }

            const mediaId = mediaResponse.data.id;
            console.log(`Media created on official account: ${mediaId}`);

            // Step 2: Publish the media
            console.log(`Publishing to PropertyHub official Instagram...`);
            const publishResponse = await axios.post(
                `${this.instagramGraphUrl}/${this.instagramApiVersion}/${mediaId}/publish`,
                {
                    access_token: officialAccessToken,
                },
                { timeout: 30000 }
            );

            if (!publishResponse.data?.id) {
                throw new BadRequestException('Failed to publish media on official account');
            }

            const postUrl = `https://instagram.com/p/${publishResponse.data.id}`;
            console.log(`Reel published to official account: ${postUrl}`);

            // Step 3: Update reel in database
            await this.prisma.reel.update({
                where: { id: reelId },
                data: {
                    instagramPostUrl: postUrl,
                    instagramStatus: 'APPROVED',
                },
            });

            return {
                postUrl,
                mediaId: publishResponse.data.id,
            };
        } catch (error: any) {
            console.error(`Failed to publish to official Instagram:`, error.message);
            
            // Mark as failed
            await this.prisma.reel.update({
                where: { id: reelId },
                data: {
                    instagramStatus: 'REJECTED',
                    officialInstagramModerationNote: `Failed to publish: ${error.message}`,
                },
            });

            throw new InternalServerErrorException(
                `Failed to publish to official Instagram: ${error.response?.data?.error?.message || error.message}`
            );
        }
    }

    /**
     * Reject reel from PropertyHub official Instagram publishing
     */
    async rejectReelFromOfficialPublishing(
        reelId: string,
        reason: string,
    ): Promise<void> {
        await this.prisma.reel.update({
            where: { id: reelId },
            data: {
                instagramStatus: 'REJECTED',
                officialInstagramModerationNote: reason,
            },
        });
    }
}
