import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CommissionManagersService } from './commission-managers.service';
import { CreateCommissionManagerDto, UpdateCommissionManagerProfileDto } from './commission-managers.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/require-roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';

@Controller('api/commission-managers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommissionManagersController {
    constructor(private readonly commissionManagersService: CommissionManagersService) { }

    @Post()
    @RequireRoles('central-authority')
    create(@Body() dto: CreateCommissionManagerDto) {
        return this.commissionManagersService.create(dto);
    }

    @Get()
    @RequireRoles('central-authority')
    findAll() {
        return this.commissionManagersService.findAll();
    }

    @Get('me/profile')
    @RequireRoles('commission-manager')
    async getMyProfile(@CurrentUser() user: AuthenticatedUser) {
        return this.commissionManagersService.getProfile(user.userId);
    }

    @Post('me/profile')
    @RequireRoles('commission-manager')
    async upsertMyProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateCommissionManagerProfileDto,
    ) {
        return this.commissionManagersService.upsertProfile(user.userId, dto);
    }
}
