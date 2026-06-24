import { IsString, IsOptional, IsBoolean, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateBankBranchDto {
    @IsUUID()
    @IsNotEmpty()
    bankId: string;

    @IsUUID()
    @IsNotEmpty()
    cityId: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpdateBankBranchDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
