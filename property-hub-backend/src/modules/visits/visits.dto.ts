import { IsString, IsNotEmpty, IsISO8601, IsOptional, IsEnum } from 'class-validator';
import { VisitStatus } from '@prisma/client';

export class CreateVisitDto {
    @IsString()
    @IsNotEmpty()
    leadId: string;

    @IsISO8601()
    @IsNotEmpty()
    scheduledAt: string;

    @IsString()
    @IsOptional()
    visitExecutiveId?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateVisitDto {
    @IsISO8601()
    @IsOptional()
    scheduledAt?: string;

    @IsString()
    @IsOptional()
    visitExecutiveId?: string;

    @IsEnum(VisitStatus)
    @IsOptional()
    status?: VisitStatus;

    @IsString()
    @IsOptional()
    notes?: string;
}
