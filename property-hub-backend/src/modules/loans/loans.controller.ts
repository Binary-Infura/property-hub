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
import { CreateLoanDto, UpdateLoanStatusDto } from './loans.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Controller('api/loans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoansController {
    constructor(private readonly loansService: LoansService) { }

    @Post()
    @RequireRoles('consultant', 'central-authority')
    create(@Body() dto: CreateLoanDto) {
        return this.loansService.create(dto);
    }

    @Get()
    @RequireRoles('consultant', 'central-authority', 'loan-adviser')
    findAll(@CurrentUser() user: AuthenticatedUser) {
        if (user.roles.includes('central-authority') || user.roles.includes('loan-adviser')) {
            return this.loansService.getALl();
        }
        return this.loansService.findByConsultant(user.userId);
    }

    @Get(':id')
    @RequireRoles('consultant', 'central-authority', 'loan-adviser')
    findOne(@Param('id') id: string) {
        return this.loansService.findOne(id);
    }

    @Patch(':id/status')
    @RequireRoles('loan-adviser', 'central-authority')
    updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateLoanStatusDto
    ) {
        return this.loansService.updateStatus(id, dto);
    }
}
