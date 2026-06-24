import { IsString, IsOptional, IsNumber, IsArray, IsEmail } from 'class-validator';

export class UpdateBuyerProfileDto {
    @IsNumber()
    @IsOptional()
    budgetMin?: number;

    @IsNumber()
    @IsOptional()
    budgetMax?: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    preferredLocations?: string[];
}

export class RegisterBuyerDto {
    @IsString()
    firstName: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsString() // Changed from IsEmail to IsString because phone is not email, wait. The field is email.
    @IsEmail()
    email: string;

    @IsString()
    phone: string;

    @IsString()
    budget: string; // e.g. "20-40"

    @IsString()
    location: string;

    @IsString()
    intent: string;
}
