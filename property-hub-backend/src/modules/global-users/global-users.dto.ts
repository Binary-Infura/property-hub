import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateGlobalUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    name: string; // Providing direct name instead of first/last split in UI? UI shows Name field.

    @IsString()
    @IsOptional()
    phone?: string;
}

export class GlobalUserDto {
    id: string;
    keycloakId: string | null;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
