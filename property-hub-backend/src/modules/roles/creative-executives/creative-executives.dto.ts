import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateCreativeExecutiveProfileDto {
    @IsUrl()
    @IsOptional()
    portfolioUrl?: string;
}
