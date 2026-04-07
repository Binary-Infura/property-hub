import { IsString, IsOptional } from 'class-validator';

export class UpdateLoanPartnerProfileDto {
    @IsOptional()
    @IsString()
    companyName?: string;

    @IsOptional()
    @IsString()
    companyAddress?: string;

    @IsOptional()
    @IsString()
    taxId?: string;

    @IsOptional()
    @IsString()
    licenseNumber?: string;
}
