import { IsString, IsOptional, IsEmail, IsArray, IsEnum, IsNumber, IsNotEmpty, IsObject, IsBoolean, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../common/enums/role.enum';

export class InviteUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsArray()
    @IsEnum(UserRole, { each: true })
    @IsOptional()
    roles?: UserRole[];
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

export class UpdateUserPreferencesDto {
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

    @IsString()
    @IsOptional()
    regionPreference?: string;
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

    @IsArray()
    @IsEnum(UserRole, { each: true })
    roles: UserRole[];

    @IsEnum(UserRole)
    @IsOptional()
    primaryRole?: UserRole;

    @IsString()
    @IsOptional()
    @MinLength(6)
    password?: string;

    @IsString()
    @IsOptional()
    reraId?: string;

    // Organization FK — supply when creating PROPERTY_PARTNER, BROKER in org, etc.
    @IsString()
    @IsOptional()
    organizationId?: string;

    // Property Partner / Builder Profile Fields (now go to Organization)
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

    // Broker Specific Fields
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
    brokerType?: string; // 'INDIVIDUAL', 'FIRM'








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
    avatarUrl?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsArray()
    @IsEnum(UserRole, { each: true })
    @IsOptional()
    roles?: UserRole[];

    @IsEnum(UserRole)
    @IsOptional()
    primaryRole?: UserRole;

    @IsString()
    @IsOptional()
    reraId?: string;

    @IsString()
    @IsOptional()
    organizationId?: string;

    // Organization-level fields (if managing org inline)
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

    // Broker Specific Fields
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
    brokerType?: string;






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

    @IsEnum(UserRole)
    @IsOptional()
    primaryRole?: UserRole;

    /**
     * Role-specific profile data stored as a JSON blob on the User row.
     * The shape varies by role — examples:
     *
     * BUYER:           { budgetMin, budgetMax, preferredLocations, propertyTypes }
     * CONSULTANT:      { consultantType, specialization, experienceYears, rating }
     * INFLUENCER:      { socialMediaLinks, reach, niche }
     * BROKER:          { agencyName, officeAddress, reraNumber, brokerType }
     * PROPERTY_PARTNER: { companyName, companyAddress, taxId, licenseNumber }
     */
    @IsObject()
    @IsOptional()
    profileData?: Record<string, any>;
}
