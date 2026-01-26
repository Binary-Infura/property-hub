import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { MarketingLeadsService } from './marketing-leads.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/require-roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { UpdateMarketingLeadProfileDto } from './marketing-leads.dto';

@Controller('api/marketing-leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles('marketing-lead')
export class MarketingLeadsController {
    constructor(private readonly marketingLeadsService: MarketingLeadsService) { }

    @Get('profile')
    async getProfile(@CurrentUser() user: AuthenticatedUser) {
        return this.marketingLeadsService.getProfile(user.userId);
    }

    @Post('profile')
    async upsertProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateMarketingLeadProfileDto,
    ) {
        return this.marketingLeadsService.upsertProfile(user.userId, dto);
    }
}
