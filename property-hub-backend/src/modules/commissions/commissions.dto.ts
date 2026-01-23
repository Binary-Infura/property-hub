import { IsString, IsOptional, IsEnum, IsUUID, IsNumber, Min } from 'class-validator';
import { CommissionStatus } from '@prisma/client';

export class CreateCommissionDto {
    @IsNumber()
    @Min(0)
    amount: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    percentage?: number;

    @IsString()
    agentId: string;

    @IsUUID()
    propertyId: string;

    @IsEnum(CommissionStatus)
    @IsOptional()
    status?: CommissionStatus;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateCommissionDto {
    @IsNumber()
    @Min(0)
    @IsOptional()
    amount?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    percentage?: number;

    @IsEnum(CommissionStatus)
    @IsOptional()
    status?: CommissionStatus;

    @IsString()
    @IsOptional()
    notes?: string;
}
