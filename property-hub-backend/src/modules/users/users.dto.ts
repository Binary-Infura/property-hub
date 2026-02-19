import { IsString, IsOptional, IsEmail, IsArray, IsNumber, IsNotEmpty, IsObject, ValidateNested, MinLength } from 'class-validator';
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

    @IsString()
    @IsOptional()
    theme?: string;

    @IsObject()
    @IsOptional()
    notifications?: any;

    @IsString()
    @IsOptional()
    onboardingStatus?: string;

    @IsString()
    @IsOptional()
    language?: string;
}

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsOptional()
    lastName?: string;

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


    @IsString()
    @IsOptional()
    @MinLength(6)
    password?: string;

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

    // Property Partner Profile Fields
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

export class UpdateUserDto {
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

    // Property Partner Profile Fields
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

export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    // Property Partner Specific
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

    // Service Provider Specific
    @IsString()
    @IsOptional()
    businessName?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    location?: string;

    // Influencer Specific
    @IsObject()
    @IsOptional()
    socialMediaLinks?: any;

    @IsNumber()
    @IsOptional()
    reach?: number;

    @IsString()
    @IsOptional()
    niche?: string;
}
