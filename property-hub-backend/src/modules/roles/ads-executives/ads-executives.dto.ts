import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateAdsExecutiveProfileDto {
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    platformSpecialty?: string[];
}
