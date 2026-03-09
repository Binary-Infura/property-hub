import { Controller, Get, Post, Query, UseGuards, Body, Param } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';

@ApiTags('instagram')
@Controller('api/instagram')
export class InstagramController {
    constructor(
        private instagramService: InstagramService,
        private usersService: UsersService,
    ) {}

    @Get('oauth-url')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get Instagram OAuth redirect URL' })
    getOAuthUrl(@CurrentUser() user: AuthenticatedUser) {
        const url = this.instagramService.getOAuthRedirectUrl(user.userId);
        return { url };
    }

    @Post('oauth-callback')
    @ApiOperation({ summary: 'Handle Instagram OAuth callback' })
    async handleOAuthCallback(
        @Query('code') code: string,
        @Query('state') userId: string,
    ) {
        if (!code || !userId) {
            throw new Error('Missing code or state parameter');
        }

        // Exchange code for token
        const { accessToken, userId: instagramUserId } = 
            await this.instagramService.exchangeCodeForToken(code);

        // Get Instagram user info
        const { username } = await this.instagramService.getInstagramUserInfo(accessToken);

        // Store credentials
        await this.instagramService.storeInstagramCredentials(
            userId,
            accessToken,
            instagramUserId,
            username
        );

        return { 
            success: true, 
            message: 'Instagram account connected successfully',
            username,
        };
    }

    @Get('check-connection')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Check if Instagram account is connected' })
    async checkConnection(@CurrentUser() user: AuthenticatedUser) {
        try {
            const internalUser = await this.usersService.ensureUserSynced(user);
            const creds = await this.instagramService.getInstagramCredentials(internalUser.id);
            return {
                connected: true,
                username: creds.instagramUsername,
            };
        } catch (error) {
            return {
                connected: false,
                username: null,
            };
        }
    }

    @Post('disconnect')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Disconnect Instagram account' })
    async disconnect(@CurrentUser() user: AuthenticatedUser) {
        const internalUser = await this.usersService.ensureUserSynced(user);
        await this.instagramService.disconnectInstagramAccount(internalUser.id);
        return { success: true, message: 'Instagram account disconnected' };
    }

    @Post('reels/:reelId/publish-to-partner')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Publish reel to partner Instagram account' })
    async publishToPartnerAccount(
        @Param('reelId') reelId: string,
        @CurrentUser() user: AuthenticatedUser,
        @Body() body: { videoUrl: string; caption: string },
    ) {
        const internalUser = await this.usersService.ensureUserSynced(user);
        
        try {
            const result = await this.instagramService.publishReelToPartnerAccount(
                reelId,
                body.videoUrl,
                body.caption,
                internalUser.id,
            );
            
            return {
                success: true,
                message: 'Reel published to Instagram',
                postUrl: result.postUrl,
                mediaId: result.mediaId,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Post('reels/:reelId/request-official-publish')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Request to publish reel on PropertyHub official Instagram' })
    async requestOfficialPublishing(@Param('reelId') reelId: string) {
        await this.instagramService.requestOfficialInstagramPublishing(reelId);
        return {
            success: true,
            message: 'Reel submitted for moderation. Admin will review and approve/reject.',
        };
    }

    @Post('reels/:reelId/approve-official')
    @UseGuards(JwtAuthGuard)
    @RequireRoles('admin', 'central-authority')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Approve and publish reel to PropertyHub official Instagram' })
    async approveOfficialPublishing(
        @Param('reelId') reelId: string,
        @Body() body: { videoUrl: string; caption: string },
    ) {
        try {
            const result = await this.instagramService.approveReelForOfficialPublishing(
                reelId,
                body.videoUrl,
                body.caption,
            );
            
            return {
                success: true,
                message: 'Reel approved and published to PropertyHub official Instagram',
                postUrl: result.postUrl,
                mediaId: result.mediaId,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Post('reels/:reelId/reject-official')
    @UseGuards(JwtAuthGuard)
    @RequireRoles('admin', 'central-authority')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reject reel from PropertyHub official Instagram' })
    async rejectOfficialPublishing(
        @Param('reelId') reelId: string,
        @Body() body: { reason: string },
    ) {
        await this.instagramService.rejectReelFromOfficialPublishing(reelId, body.reason);
        return {
            success: true,
            message: 'Reel rejected. Partner will be notified.',
        };
    }
}
