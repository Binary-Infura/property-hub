import { IsString, IsOptional, IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateCentralAuthorityProfileDto {
    @IsString()
    @IsOptional()
    department?: string;

    @IsString()
    @IsOptional()
    accessLevel?: string;
}

export class CreateCentralAuthorityUserDto {
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
    phone?: string;
}

export class CentralAuthorityUserDto {
    id: string;
    keycloakId: string | null;
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string | null;
    role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
