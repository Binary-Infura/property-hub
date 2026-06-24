import { IsString, IsOptional, IsEmail, Length } from 'class-validator';

export class SendOtpDto {
    @IsOptional()
    @IsString()
    @Length(10, 15)
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    checkExists?: boolean;
}

export class VerifyOtpDto {
    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsString()
    @Length(4, 4)
    code: string;

    @IsOptional()
    consume?: boolean = true;
}
