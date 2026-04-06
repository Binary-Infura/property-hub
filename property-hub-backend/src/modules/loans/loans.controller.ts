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
import {
    CreateBuyerLoanApplicationDto,
    UpdateBuyerLoanStatusDto,
    AssignBuyerLoanPartnerDto,
    LinkBuyerLoanDocumentsDto,
    CreateProjectLoanApplicationDto,
    UpdateProjectLoanReviewDto,
    AssignProjectLoanPartnerDto,
    LinkProjectLoanDocumentsDto,
} from './loans.dto';
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

    // ────────────────────────────────────────────────
    // FLOW 1: Buyer Loan Applications
    // ────────────────────────────────────────────────

    @Post('buyer')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.CONSULTANT)
    createBuyerLoan(@Body() dto: CreateBuyerLoanApplicationDto) {
        return this.loansService.createBuyerLoan(dto);
    }

    @Get('buyer')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.LOAN_PARTNER)
    getAllBuyerLoans(@CurrentUser() user: AuthenticatedUser) {
        if (user.roles.includes(UserRole.LOAN_PARTNER) && !user.roles.includes(UserRole.CENTRAL_AUTHORITY)) {
            return this.loansService.getBuyerLoansByPartner(user.userId);
        }
        return this.loansService.getAllBuyerLoans();
    }

    @Get('buyer/:id')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.LOAN_PARTNER)
    getBuyerLoanById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        const isLP = user.roles.includes(UserRole.LOAN_PARTNER) && !user.roles.includes(UserRole.CENTRAL_AUTHORITY);
        return this.loansService.getBuyerLoanById(id, user.userId, isLP);
    }

    @Patch('buyer/:id/status')
    @RequireRoles(UserRole.LOAN_PARTNER, UserRole.CENTRAL_AUTHORITY)
    updateBuyerLoanStatus(
        @Param('id') id: string,
        @Body() dto: UpdateBuyerLoanStatusDto,
        @CurrentUser() user: AuthenticatedUser
    ) {
        const isLP = user.roles.includes(UserRole.LOAN_PARTNER) && !user.roles.includes(UserRole.CENTRAL_AUTHORITY);
        return this.loansService.updateBuyerLoanStatus(id, dto, user.userId, isLP);
    }

    @Patch('buyer/:id/assign')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    assignBuyerLoanPartner(@Param('id') id: string, @Body() dto: AssignBuyerLoanPartnerDto) {
        return this.loansService.assignBuyerLoanPartner(id, dto);
    }

    @Patch('buyer/:id/documents')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.LOAN_PARTNER)
    linkBuyerLoanDocuments(@Param('id') id: string, @Body() dto: LinkBuyerLoanDocumentsDto) {
        return this.loansService.linkBuyerLoanDocuments(id, dto);
    }

    // ────────────────────────────────────────────────
    // FLOW 2: Project Loan Applications
    // ────────────────────────────────────────────────

    @Post('project')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.PROPERTY_PARTNER)
    createProjectLoanApplications(@Body() dto: CreateProjectLoanApplicationDto) {
        return this.loansService.createProjectLoanApplications(dto);
    }

    @Get('project')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.LOAN_PARTNER, UserRole.PROPERTY_PARTNER)
    getAllProjectLoanApps(@CurrentUser() user: AuthenticatedUser) {
        if (user.roles.includes(UserRole.LOAN_PARTNER) && !user.roles.includes(UserRole.CENTRAL_AUTHORITY)) {
            return this.loansService.getProjectLoanAppsByPartner(user.userId);
        }
        if (user.roles.includes(UserRole.PROPERTY_PARTNER) && !user.roles.includes(UserRole.CENTRAL_AUTHORITY)) {
            return this.loansService.getProjectLoanAppsByOwner(user.userId);
        }
        return this.loansService.getAllProjectLoanApps();
    }

    @Get('project/:id')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.LOAN_PARTNER)
    getProjectLoanAppById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        const isLP = user.roles.includes(UserRole.LOAN_PARTNER) && !user.roles.includes(UserRole.CENTRAL_AUTHORITY);
        return this.loansService.getProjectLoanAppById(id, user.userId, isLP);
    }

    @Patch('project/:id/review')
    @RequireRoles(UserRole.LOAN_PARTNER, UserRole.CENTRAL_AUTHORITY)
    updateProjectLoanReview(
        @Param('id') id: string,
        @Body() dto: UpdateProjectLoanReviewDto,
        @CurrentUser() user: AuthenticatedUser
    ) {
        const isLP = user.roles.includes(UserRole.LOAN_PARTNER) && !user.roles.includes(UserRole.CENTRAL_AUTHORITY);
        return this.loansService.updateProjectLoanReview(id, dto, user.userId, isLP);
    }

    @Patch('project/:id/assign')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    assignProjectLoanPartner(@Param('id') id: string, @Body() dto: AssignProjectLoanPartnerDto) {
        return this.loansService.assignProjectLoanPartner(id, dto);
    }

    @Patch('project/:id/documents')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.LOAN_PARTNER)
    linkProjectLoanDocuments(@Param('id') id: string, @Body() dto: LinkProjectLoanDocumentsDto) {
        return this.loansService.linkProjectLoanDocuments(id, dto);
    }
}
