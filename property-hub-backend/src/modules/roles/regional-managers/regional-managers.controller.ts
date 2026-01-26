import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RegionalManagersService } from './regional-managers.service';
import { CreateRegionalManagerDto, UpdateRegionalManagerProfileDto } from './regional-managers.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/require-roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';

@Controller('api/regional-managers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegionalManagersController {
    constructor(private readonly regionalManagersService: RegionalManagersService) { }

    @Post()
    @RequireRoles('central-authority')
    create(@Body() createRegionalManagerDto: CreateRegionalManagerDto) {
        return this.regionalManagersService.create(createRegionalManagerDto);
    }

    @Get()
    @RequireRoles('central-authority')
    findAll() {
        return this.regionalManagersService.findAll();
    }

    @Get('me/profile')
    @RequireRoles('regional-manager')
    async getMyProfile(@CurrentUser() user: AuthenticatedUser) {
        return this.regionalManagersService.getProfile(user.userId);
    }

    @Post('me/profile')
    @RequireRoles('regional-manager')
    async upsertMyProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateRegionalManagerProfileDto,
    ) {
        return this.regionalManagersService.upsertProfile(user.userId, dto);
    }
}
