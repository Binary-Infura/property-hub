import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InviteUserDto, InviteCentralAuthorityDto, InvitationResponse } from './invitation.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RegionGuard } from '../../auth/guards/region.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { RequireRegion } from '../../common/decorators/require-region.decorator';

/**
 * Controller for user invitation endpoints
 * Only accessible by authorized users
 */
@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles('central-authority', 'regional-manager', 'marketing-manager', 'commission-manager', 'property-onboarding-manager', 'property-partner', 'channel-partner', 'consultant', 'ads-executive', 'creative-executive', 'marketing-lead')
export class InvitationController {
    constructor(private readonly invitationService: InvitationService) { }

    /**
     * Invite a user to a specific region with roles
     * Requires regional-manager role in the target region
     */
    @Post(':region/users/invite')
    @UseGuards(RegionGuard)
    @RequireRegion()
    @RequireRoles('regional-manager')
    async inviteUserToRegion(
        @Param('region') region: string,
        @Body() dto: InviteUserDto,
    ): Promise<InvitationResponse> {
        return this.invitationService.inviteUser(dto);
    }

    /**
     * Invite a central authority user
     * Only accessible by existing central authority users
     */
    @RequireRoles('central-authority')
    @Post('users/invite-central')
    async inviteCentralAuthority(
        @Body() dto: InviteCentralAuthorityDto,
    ): Promise<InvitationResponse> {
        return this.invitationService.inviteCentralAuthorityUser(dto);
    }
}
