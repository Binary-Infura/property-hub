import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, Min } from 'class-validator';
import { LoanStatus } from '@prisma/client';

export class CreateLoanDto {
    @IsUUID()
    leadId: string;

    @IsUUID()
    projectId: string;

    @IsUUID()
    bankId: string;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsNumber()
    @Min(1)
    tenureYears: number;

    @IsNumber()
    interestRate: number;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateLoanStatusDto {
    @IsEnum(LoanStatus)
    status: LoanStatus;
}
