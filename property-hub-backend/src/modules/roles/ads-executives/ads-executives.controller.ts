import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AdsExecutivesService } from './ads-executives.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/require-roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { UpdateAdsExecutiveProfileDto } from './ads-executives.dto';

@Controller('api/ads-executives')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles('ads-executive')
export class AdsExecutivesController {
    constructor(private readonly adsExecutivesService: AdsExecutivesService) { }

    @Get('profile')
    async getProfile(@CurrentUser() user: AuthenticatedUser) {
        return this.adsExecutivesService.getProfile(user.userId);
    }

    @Post('profile')
    async upsertProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateAdsExecutiveProfileDto,
    ) {
        return this.adsExecutivesService.upsertProfile(user.userId, dto);
    }
}
