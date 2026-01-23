import { IsEmail, IsString, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Structure for region roles in invitation
 */
class RegionRoleDto {
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    roles: string[];
}

/**
 * DTO for inviting an internal user
 */
export class InviteInternalUserDto {
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
}

/**
 * DTO for inviting a central authority user
 */
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

/**
 * Response after invitation
 */
export interface InvitationResponse {
    userId: string;
    email: string;
    temporaryPassword: string;
}
