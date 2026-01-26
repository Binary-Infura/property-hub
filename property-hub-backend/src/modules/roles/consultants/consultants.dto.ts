import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class UpdateConsultantProfileDto {
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    specialization?: string[];

    @IsNumber()
    @IsOptional()
    experienceYears?: number;
}
