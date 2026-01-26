import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { MarketingManagersService } from './marketing-managers.service';
import { CreateMarketingManagerDto, UpdateMarketingManagerProfileDto } from './marketing-managers.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/require-roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';

@Controller('api/marketing-managers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarketingManagersController {
    constructor(private readonly marketingManagersService: MarketingManagersService) { }

    @Post()
    @RequireRoles('central-authority')
    create(@Body() dto: CreateMarketingManagerDto) {
        return this.marketingManagersService.create(dto);
    }

    @Get()
    @RequireRoles('central-authority')
    findAll() {
        return this.marketingManagersService.findAll();
    }

    @Get('me/profile')
    @RequireRoles('marketing-manager')
    async getMyProfile(@CurrentUser() user: AuthenticatedUser) {
        return this.marketingManagersService.getProfile(user.userId);
    }

    @Post('me/profile')
    @RequireRoles('marketing-manager')
    async upsertMyProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateMarketingManagerProfileDto,
    ) {
        return this.marketingManagersService.upsertProfile(user.userId, dto);
    }
}
