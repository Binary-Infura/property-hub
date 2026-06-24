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

export class CreateBrokerDto {
    @IsString()
    firstName: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsString()
    email: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    agencyName?: string;

    @IsString()
    @IsOptional()
    officeAddress?: string;

    @IsString()
    @IsOptional()
    reraNumber?: string;

    @IsString()
    @IsOptional()
    reraId?: string;

    @IsString()
    @IsOptional()
    brokerType?: 'INDIVIDUAL' | 'FIRM' | 'ORGANIZATION';
}

