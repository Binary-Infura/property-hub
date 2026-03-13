import { IsEmail, IsNotEmpty, IsOptional, IsString, IsArray, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../../common/enums/role.enum';

export class CreateInvitationDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @IsEnum(UserRole, { each: true })
  @IsNotEmpty()
  roles: UserRole[];
}

export class VerifyInvitationDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class RegisterInvitationDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

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

  @IsString()
  @IsOptional()
  agencyName?: string;

  @IsString()
  @IsOptional()
  officeAddress?: string;

  @IsString()
  @IsOptional()
  reraNumber?: string;
}
