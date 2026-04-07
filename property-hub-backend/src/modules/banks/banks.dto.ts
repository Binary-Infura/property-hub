import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateBankDto {
    @IsString()
    name: string;

    @IsNumber()
    percentage: number;

    @IsString()
    @IsOptional()
    logoUrl?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpdateBankDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @IsOptional()
    percentage?: number;

    @IsString()
    @IsOptional()
    logoUrl?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
