import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCampaignDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty()
    @IsString()
    platform: string;

    @ApiProperty()
    @IsNumber()
    budget: number;

    @ApiProperty()
    @IsDateString()
    startDate: string;

    @ApiProperty()
    @IsDateString()
    endDate: string;


    @ApiProperty({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    assignedUserIds: string[];
}

export class UpdateCampaignDto extends CreateCampaignDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    spent?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    impressions?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    clicks?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    leadsCount?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    conversions?: number;
}
