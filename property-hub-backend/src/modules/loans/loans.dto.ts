import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, Min, IsArray } from 'class-validator';
import { BuyerLoanStatus, ReviewStatus, BankStatus } from '@prisma/client';

// ─────────────────────────────────────────────
// Flow 1: Buyer Loan Application DTOs
// ─────────────────────────────────────────────

export class CreateBuyerLoanApplicationDto {
    @IsUUID()
    @IsOptional()
    leadId?: string;

    @IsUUID()
    @IsOptional()
    projectId?: string;

    @IsNumber()
    @Min(0)
    loanAmount: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    eligibleAmount?: number;

    @IsUUID()
    @IsOptional()
    bankId?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateBuyerLoanStatusDto {
    @IsEnum(BuyerLoanStatus)
    status: BuyerLoanStatus;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class AssignBuyerLoanPartnerDto {
    @IsUUID()
    assignedLoanPartnerId: string;
}

export class LinkBuyerLoanDocumentsDto {
    @IsArray()
    @IsUUID('4', { each: true })
    documentIds: string[];
}

// ─────────────────────────────────────────────
// Flow 2: Project Loan Application DTOs
// ─────────────────────────────────────────────

export class CreateProjectLoanApplicationDto {
    @IsUUID()
    projectId: string;

    @IsArray()
    @IsUUID('4', { each: true })
    bankIds: string[];
}

export class UpdateProjectLoanReviewDto {
    @IsEnum(ReviewStatus)
    @IsOptional()
    reviewStatus?: ReviewStatus;

    @IsEnum(BankStatus)
    @IsOptional()
    bankStatus?: BankStatus;

    @IsString()
    @IsOptional()
    remarks?: string;
}

export class AssignProjectLoanPartnerDto {
    @IsUUID()
    assignedLoanPartnerId: string;
}

export class LinkProjectLoanDocumentsDto {
    @IsArray()
    @IsUUID('4', { each: true })
    documentIds: string[];
}
