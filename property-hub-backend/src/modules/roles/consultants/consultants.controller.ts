import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ConsultantsService } from './consultants.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/require-roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { UpdateConsultantProfileDto } from './consultants.dto';

@Controller('api/consultants')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles('consultant')
export class ConsultantsController {
    constructor(private readonly consultantsService: ConsultantsService) { }

    @Get('profile')
    async getProfile(@CurrentUser() user: AuthenticatedUser) {
        return this.consultantsService.getProfile(user.userId);
    }

    @Post('profile')
    async upsertProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateConsultantProfileDto,
    ) {
        return this.consultantsService.upsertProfile(user.userId, dto);
    }

    @Get('assigned-properties')
    async getAssignedProperties(@CurrentUser() user: AuthenticatedUser) {
        return this.consultantsService.getAssignedPropertiesWithDetails(user.userId);
    }
}
