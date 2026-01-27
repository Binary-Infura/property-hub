import { IsString, IsOptional, IsEmail, IsArray, IsNumber, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RegionRoleDto {
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    roles: string[];
}

export class InviteUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsObject()
    @ValidateNested()
    @Type(() => Object)
    regions: { [region: string]: RegionRoleDto };

    @IsString()
    @IsOptional()
    role?: string;
}

export class InviteCentralAuthorityDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;
}

export interface InvitationResponse {
    userId: string;
    email: string;
    temporaryPassword: string;
}

export class UpdateUserMetadataDto {
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    regionPreference?: string;
}

export class CreateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    role: string;

    @IsString()
    @IsOptional()
    agencyName?: string;

    @IsString()
    @IsOptional()
    reraId?: string;

    @IsNumber()
    @IsOptional()
    rating?: number;

    @IsArray()
    @IsOptional()
    regionIds?: string[];

    // Service Provider Profile Fields
    @IsString()
    @IsOptional()
    businessName?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsArray()
    @IsOptional()
    availabilityDays?: string[];

    @IsString()
    @IsOptional()
    availabilityHours?: string;

    @IsString()
    @IsOptional()
    rates?: string;

    @IsString()
    @IsOptional()
    portfolio?: string;
}

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsString()
    @IsOptional()
    agencyName?: string;

    @IsString()
    @IsOptional()
    reraId?: string;

    @IsNumber()
    @IsOptional()
    rating?: number;

    @IsArray()
    @IsOptional()
    regionIds?: string[];

    // Service Provider Profile Fields
    @IsString()
    @IsOptional()
    businessName?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsArray()
    @IsOptional()
    availabilityDays?: string[];

    @IsString()
    @IsOptional()
    availabilityHours?: string;

    @IsString()
    @IsOptional()
    rates?: string;

    @IsString()
    @IsOptional()
    portfolio?: string;
}
