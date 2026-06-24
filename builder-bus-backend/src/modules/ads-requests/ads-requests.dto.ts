import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdsRequestDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;


    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    projectId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    budget?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    platform?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
    priority?: string;
}

export class UpdateAdsRequestDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'])
    status?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
    priority?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    budget?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    platform?: string;
}
