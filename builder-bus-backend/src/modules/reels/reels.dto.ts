import { IsString, IsOptional, IsUrl, IsNotEmpty, IsBoolean, IsEnum } from 'class-validator';
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
    @IsString()
    @IsNotEmpty()
    videoUrl: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    thumbnailUrl?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    projectId: string;

    @ApiProperty({ required: false, default: false, description: "Request to publish on BuilderBus Official Instagram" })
    @IsBoolean()
    @IsOptional()
    publishToOfficialInstagram?: boolean;

    @ApiProperty({ required: false, default: false, description: "Publish to partner's own Instagram account" })
    @IsBoolean()
    @IsOptional()
    publishToPartnerInstagram?: boolean;

    @ApiProperty({ required: false, description: "Auto-generated Instagram caption" })
    @IsString()
    @IsOptional()
    instagramCaption?: string;
}

export class UpdateReelInstagramDto {
    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    publishToOfficialInstagram?: boolean;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    publishToPartnerInstagram?: boolean;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    instagramCaption?: string;
}
