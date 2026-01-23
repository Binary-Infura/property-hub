import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegionDto {
    @ApiProperty({ example: 'mumbai-west', description: 'Unique code for the region' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ example: 'Mumbai West', description: 'Display name of the region' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: true, description: 'Whether the region is active', required: false })
    @IsBoolean()
    @IsOptional()
    active?: boolean;
}

export class UpdateRegionDto {
    @ApiProperty({ example: 'Mumbai West', description: 'Display name of the region', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: true, description: 'Whether the region is active', required: false })
    @IsBoolean()
    @IsOptional()
    active?: boolean;
}
