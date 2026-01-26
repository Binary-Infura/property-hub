import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ChannelPartnersService } from './channel-partners.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/require-roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { UpdateChannelPartnerProfileDto } from './channel-partners.dto';

@Controller('api/channel-partners')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles('channel-partner')
export class ChannelPartnersController {
    constructor(private readonly channelPartnersService: ChannelPartnersService) { }

    @Get('profile')
    async getProfile(@CurrentUser() user: AuthenticatedUser) {
        return this.channelPartnersService.getProfile(user.userId);
    }

    @Post('profile')
    async upsertProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateChannelPartnerProfileDto,
    ) {
        return this.channelPartnersService.upsertProfile(user.userId, dto);
    }
}
