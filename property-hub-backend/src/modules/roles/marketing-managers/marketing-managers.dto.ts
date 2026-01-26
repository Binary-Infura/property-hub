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
}

export class MarketingManagerDto {
    id: string;
    keycloakId: string | null;
    name: string;
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
