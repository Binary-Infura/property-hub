import { IsString, IsOptional } from 'class-validator';

export class UpdateMarketingLeadProfileDto {
    @IsString()
    @IsOptional()
    specialization?: string;
}
