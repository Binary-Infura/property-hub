import { IsString, IsOptional, IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReelDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsUrl()
    @IsNotEmpty()
    videoUrl: string;

    @ApiProperty({ required: false })
    @IsUrl()
    @IsOptional()
    thumbnailUrl?: string;
}
