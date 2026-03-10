import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/require-roles.decorator';
import { UserRole } from '../../../common/enums/role.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { UpdateBuyerProfileDto } from './buyers.dto';

@Controller('api/buyers')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(UserRole.BUYER)
export class BuyersController {
    constructor(private readonly buyersService: BuyersService) { }

    @Get('profile')
    async getProfile(@CurrentUser() user: AuthenticatedUser) {
        return this.buyersService.getProfile(user.userId);
    }

    @Post('profile')
    async upsertProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateBuyerProfileDto,
    ) {
        return this.buyersService.upsertProfile(user.userId, dto);
    }
}
