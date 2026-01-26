import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PropertyPartnersService } from './property-partners.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/require-roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { UpdatePropertyPartnerProfileDto } from './property-partners.dto';

@Controller('api/property-partners')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles('property-partner')
export class PropertyPartnersController {
    constructor(private readonly propertyPartnersService: PropertyPartnersService) { }

    @Get('profile')
    async getProfile(@CurrentUser() user: AuthenticatedUser) {
        return this.propertyPartnersService.getProfile(user.userId);
    }

    @Post('profile')
    async upsertProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdatePropertyPartnerProfileDto,
    ) {
        return this.propertyPartnersService.upsertProfile(user.userId, dto);
    }
}
