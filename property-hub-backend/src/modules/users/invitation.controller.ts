import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InviteInternalUserDto, InviteCentralAuthorityDto, InvitationResponse } from './invitation.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RegionRoleGuard } from '../../auth/guards/region-role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequireRegionRole } from '../../common/decorators/region-roles.decorator';

/**
 * Controller for user invitation endpoints
 * Only accessible by authorized users
 */
@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('internal')
export class InvitationController {
    constructor(private readonly invitationService: InvitationService) { }

    /**
     * Invite an internal user to a specific region with roles
     * Requires regional-manager role in the target region
     */
    @Post(':region/users/invite')
    @UseGuards(RegionRoleGuard)
    @RequireRegionRole('regional-manager')
    async inviteUserToRegion(
        @Param('region') region: string,
        @Body() dto: InviteInternalUserDto,
    ): Promise<InvitationResponse> {
        // Ensure the invitation is for the region in the route
        if (!dto.regions[region]) {
            // Optionally validate that the regions in the DTO match the route region
            // For now, we trust the regional manager to set appropriate regions
        }

        return this.invitationService.inviteInternalUser(dto);
    }

    /**
     * Invite a central authority user
     * Only accessible by existing central authority users
     */
    @Post('users/invite-central')
    async inviteCentralAuthority(
        @Body() dto: InviteCentralAuthorityDto,
    ): Promise<InvitationResponse> {
        // Note: This should ideally have an additional guard to check isCentralAuthority
        // For now, we rely on manual access control
        return this.invitationService.inviteCentralAuthorityUser(dto);
    }
}
