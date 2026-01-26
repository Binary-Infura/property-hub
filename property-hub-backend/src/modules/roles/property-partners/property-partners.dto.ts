import { IsString, IsOptional } from 'class-validator';

export class UpdatePropertyPartnerProfileDto {
    @IsString()
    @IsOptional()
    companyName?: string;

    @IsString()
    @IsOptional()
    companyAddress?: string;

    @IsString()
    @IsOptional()
    taxId?: string;

    @IsString()
    @IsOptional()
    licenseNumber?: string;
}
