import { IsString, IsOptional } from 'class-validator';

export class UpdateUserMetadataDto {
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    regionPreference?: string;
}
