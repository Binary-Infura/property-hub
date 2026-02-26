import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCommissionManagerDto {
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

export class CommissionManagerDto {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string | null;
    role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export class UpdateCommissionManagerProfileDto {
    @IsOptional()
    paymentAuthorityLimit?: number;
}
