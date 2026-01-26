import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
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
    @RequireRoles('central-authority', 'super-admin')
    create(@Body() dto: CreateCentralAuthorityUserDto) {
        return this.centralAuthorityService.create(dto);
    }

    @Get('users')
    @RequireRoles('central-authority', 'super-admin')
    findAll() {
        return this.centralAuthorityService.findAll();
    }
}
