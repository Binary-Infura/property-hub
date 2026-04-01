import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { GrowthPartnersService } from './growth-partners.service';
import { CreateGrowthPartnerDto, UpdateGrowthPartnerProfileDto } from './growth-partners.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/require-roles.decorator';
import { UserRole } from '../../../common/enums/role.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';

@Controller('api/growth-partners')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GrowthPartnersController {
    constructor(private readonly growthPartnersService: GrowthPartnersService) { }

    @Post()
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    create(@Body() dto: CreateGrowthPartnerDto) {
        return this.growthPartnersService.create(dto);
    }

    @Get()
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    findAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10'
    ) {
        return this.growthPartnersService.findAll(Number(page), Number(limit));
    }

    @Get('me/profile')
    @RequireRoles(UserRole.GROWTH_PARTNER)
    async getMyProfile(@CurrentUser() user: AuthenticatedUser) {
        return this.growthPartnersService.getProfile(user.userId);
    }

    @Post('me/profile')
    @RequireRoles(UserRole.GROWTH_PARTNER)
    async upsertMyProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateGrowthPartnerProfileDto,
    ) {
        return this.growthPartnersService.upsertProfile(user.userId, dto);
    }
}
