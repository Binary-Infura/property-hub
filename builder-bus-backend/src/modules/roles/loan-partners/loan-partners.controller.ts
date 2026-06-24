import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { LoanPartnersService } from './loan-partners.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/require-roles.decorator';
import { UserRole } from '../../../common/enums/role.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { UpdateLoanPartnerProfileDto } from './loan-partners.dto';

@Controller('api/loan-partners')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(UserRole.LOAN_PARTNER)
export class LoanPartnersController {
    constructor(private readonly loanPartnersService: LoanPartnersService) { }

    @Get('profile')
    async getProfile(@CurrentUser() user: AuthenticatedUser) {
        return this.loanPartnersService.getProfile(user.userId);
    }

    @Post('profile')
    async upsertProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateLoanPartnerProfileDto,
    ) {
        return this.loanPartnersService.upsertProfile(user.userId, dto);
    }
}
