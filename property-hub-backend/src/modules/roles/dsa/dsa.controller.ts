import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { DsaService } from './dsa.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/require-roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { UpdateDsaProfileDto } from './dsa.dto';

@Controller('api/dsa')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles('dsa')
export class DsaController {
    constructor(private readonly dsaService: DsaService) { }

    @Get('profile')
    async getProfile(@CurrentUser() user: AuthenticatedUser) {
        return this.dsaService.getProfile(user.userId);
    }

    @Post('profile')
    async upsertProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateDsaProfileDto,
    ) {
        return this.dsaService.upsertProfile(user.userId, dto);
    }
}
