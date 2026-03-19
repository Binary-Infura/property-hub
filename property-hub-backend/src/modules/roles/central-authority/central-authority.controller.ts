import { Controller, Get, Post, Body, UseGuards, Query, Patch, Param } from '@nestjs/common';
import { CentralAuthorityService } from './central-authority.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/require-roles.decorator';
import { UserRole } from '../../../common/enums/role.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { UpdateCentralAuthorityProfileDto, CreateCentralAuthorityUserDto } from './central-authority.dto';

@Controller('api/central-authority')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(UserRole.CENTRAL_AUTHORITY)
export class CentralAuthorityController {
    constructor(private readonly centralAuthorityService: CentralAuthorityService) { }

    @Get('dashboard-stats')
    async getDashboardStats() {
        return this.centralAuthorityService.getDashboardStats();
    }

    @Post('sync-cities')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    async syncCities() {
        return this.centralAuthorityService.syncCities();
    }

    @Get('profile')
    async getProfile(@CurrentUser() user: AuthenticatedUser) {
        return this.centralAuthorityService.getProfile(user.userId);
    }

    @Post('profile')
    async upsertProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateCentralAuthorityProfileDto,
    ) {
        return this.centralAuthorityService.upsertProfile(user.userId, dto);
    }

    @Post('users')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    create(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: CreateCentralAuthorityUserDto
    ) {
        return this.centralAuthorityService.create(user, dto);
    }

    @Get('users')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    findAll(
        @Query('role') role?: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10'
    ) {
        return this.centralAuthorityService.findAll(Number(page), Number(limit), role);
    }
    @Get('property-partners')
    async getAllPropertyPartners() {
        return this.centralAuthorityService.getAllPropertyPartners();
    }

    @Patch('property-partners/:userId/subscription')
    async updatePartnerSubscription(
        @CurrentUser() currentUser: AuthenticatedUser,
        @Param('userId') targetUserId: string,
        @Body() body: { isPremium: boolean, subscriptionMode: 'PAID' | 'FREE' }
    ) {
        return this.centralAuthorityService.updatePartnerSubscription(
            currentUser,
            targetUserId,
            body.isPremium,
            body.subscriptionMode
        );
    }

    @Get('invitations')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    async getAllInvitations(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20'
    ) {
        return this.centralAuthorityService.getAllInvitations(Number(page), Number(limit));
    }

    @Get('organizations')
    async getAllOrganizations() {
        return this.centralAuthorityService.getAllOrganizations();
    }
}
