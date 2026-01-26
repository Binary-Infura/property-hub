import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

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
