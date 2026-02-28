import { Controller, Get, Post, Body, UseGuards, Query, Patch, Param } from '@nestjs/common';
import { CentralAuthorityService } from './central-authority.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/require-roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { UpdateCentralAuthorityProfileDto, CreateCentralAuthorityUserDto } from './central-authority.dto';

@Controller('api/central-authority')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles('central-authority')
export class CentralAuthorityController {
    constructor(private readonly centralAuthorityService: CentralAuthorityService) { }

    @Get('dashboard-stats')
    async getDashboardStats() {
        return this.centralAuthorityService.getDashboardStats();
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
    @RequireRoles('central-authority')
    create(@Body() dto: CreateCentralAuthorityUserDto) {
        return this.centralAuthorityService.create(dto);
    }

    @Get('users')
    @RequireRoles('central-authority')
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
        @Param('userId') userId: string,
        @Body() body: { isPremium: boolean, subscriptionMode: 'PAID' | 'FREE' }
    ) {
        return this.centralAuthorityService.updatePartnerSubscription(
            userId,
            body.isPremium,
            body.subscriptionMode
        );
    }
}
