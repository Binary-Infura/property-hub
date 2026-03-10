import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BrokerService } from './broker.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/require-roles.decorator';
import { UserRole } from '../../../common/enums/role.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { UpdateBrokerProfileDto } from './broker.dto';

@Controller('api/broker')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(UserRole.BROKER)
export class BrokerController {
    constructor(private readonly brokerService: BrokerService) { }

    @Get('profile')
    async getProfile(@CurrentUser() user: AuthenticatedUser) {
        return this.brokerService.getProfile(user.userId);
    }

    @Post('profile')
    async upsertProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateBrokerProfileDto,
    ) {
        return this.brokerService.upsertProfile(user.userId, dto);
    }
}
