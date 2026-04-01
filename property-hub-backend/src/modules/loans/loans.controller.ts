import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    UseGuards,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto, UpdateLoanStatusDto, ApplyLoanDto } from './loans.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { UserRole } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Controller('api/loans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoansController {
    constructor(private readonly loansService: LoansService) { }

    @Post()
    @RequireRoles(UserRole.CONSULTANT, UserRole.CENTRAL_AUTHORITY)
    create(@Body() dto: CreateLoanDto) {
        return this.loansService.create(dto);
    }

    @Post('apply')
    @RequireRoles(UserRole.BUYER)
    apply(@Body() dto: ApplyLoanDto, @CurrentUser() user: AuthenticatedUser) {
        return this.loansService.applyForLoan(dto, user);
    }

    @Get()
    @RequireRoles(UserRole.CONSULTANT, UserRole.CENTRAL_AUTHORITY, UserRole.LOAN_PARTNER, UserRole.BUYER)
    findAll(@CurrentUser() user: AuthenticatedUser) {
        if (user.roles.includes(UserRole.CENTRAL_AUTHORITY) || user.roles.includes(UserRole.LOAN_PARTNER)) {
            return this.loansService.getALl();
        }
        if (user.roles.includes(UserRole.BUYER)) {
            return this.loansService.findByUser(user.email, user.phone);
        }
        return this.loansService.findByConsultant(user.userId);
    }

    @Get(':id')
    @RequireRoles(UserRole.CONSULTANT, UserRole.CENTRAL_AUTHORITY, UserRole.LOAN_PARTNER, UserRole.BUYER)
    findOne(@Param('id') id: string) {
        return this.loansService.findOne(id);
    }

    @Patch(':id/status')
    @RequireRoles(UserRole.LOAN_PARTNER, UserRole.CENTRAL_AUTHORITY)
    updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateLoanStatusDto
    ) {
        return this.loansService.updateStatus(id, dto);
    }
}
