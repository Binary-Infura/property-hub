import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto, VerifyInvitationDto, RegisterInvitationDto, PublicPartnerSignupDto } from './invitations.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { UserRole } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/invitations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.PROPERTY_PARTNER)
  async createInvitation(
    @Body() dto: CreateInvitationDto,
    @CurrentUser() user: any,
  ) {
    return this.invitationsService.createInvitation(dto, user.userId);
  }

  @Public()
  @Post('signup')
  async publicSignup(@Body() dto: PublicPartnerSignupDto) {
    return this.invitationsService.publicSignup(dto);
  }

  @Public()
  @Get('verify-signup')
  async verifyPublicSignup(@Query('token') token: string) {
    return this.invitationsService.verifyPublicSignup(token);
  }

  @Public()
  @Get('verify')
  async verifyInvitation(@Query() dto: VerifyInvitationDto) {
    return this.invitationsService.verifyInvitation(dto.token);
  }

  @Public()
  @Post('register')
  async registerFromInvitation(@Body() dto: RegisterInvitationDto) {
    return this.invitationsService.registerInvitedUser(dto);
  }
}
