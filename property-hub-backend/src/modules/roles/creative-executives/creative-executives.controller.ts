import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CreativeExecutivesService } from './creative-executives.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/require-roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { UpdateCreativeExecutiveProfileDto } from './creative-executives.dto';

@Controller('api/creative-executives')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles('creative-executive')
export class CreativeExecutivesController {
    constructor(private readonly creativeExecutivesService: CreativeExecutivesService) { }

    @Get('profile')
    async getProfile(@CurrentUser() user: AuthenticatedUser) {
        return this.creativeExecutivesService.getProfile(user.userId);
    }

    @Post('profile')
    async upsertProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateCreativeExecutiveProfileDto,
    ) {
        return this.creativeExecutivesService.upsertProfile(user.userId, dto);
    }
}
