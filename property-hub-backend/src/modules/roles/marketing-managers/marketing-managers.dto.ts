import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMarketingManagerDto {
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

    @IsOptional()
    campaignBudgetLimit?: number;
}

export class MarketingManagerDto {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export class UpdateMarketingManagerProfileDto {
    @IsOptional()
    campaignBudgetLimit?: number;
}
