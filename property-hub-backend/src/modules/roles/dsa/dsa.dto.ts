import { IsString, IsOptional } from 'class-validator';

export class UpdateDsaProfileDto {
    @IsString()
    @IsOptional()
    agencyBusinessName?: string;

    @IsString()
    @IsOptional()
    reraNumber?: string;

    @IsString()
    @IsOptional()
    officeAddress?: string;
}
