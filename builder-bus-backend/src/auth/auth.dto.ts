import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, Length } from 'class-validator';

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}

export class LoginOtpDto {
    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsString()
    @Length(4, 4)
    code: string;
}

export class ResetPasswordDto {
    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsString()
    @Length(4, 4)
    code: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    newPassword: string;
}
