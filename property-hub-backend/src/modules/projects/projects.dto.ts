import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { ProjectStatus, ProjectType } from '@prisma/client';

export class CreateProjectDto {
    @IsString()
    @IsOptional()
    videoUrl?: string;

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    location: string;

    @IsString()
    @IsOptional()
    address?: string;


    @IsEnum(ProjectStatus)
    @IsOptional()
    status?: ProjectStatus;

    @IsNumber()
    @Min(0)
    price: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    area?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    bedrooms?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    bathrooms?: number;

    @IsEnum(ProjectType)
    projectType: ProjectType;

    @IsString()
    @IsOptional()
    category?: string;

    @IsUUID()
    @IsOptional()
    cityId?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    cityName?: string;

    @IsString()
    @IsOptional()
    pincode?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    totalBuildings?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    totalUnits?: number;

    @IsUUID()
    @IsOptional()
    onboardedById?: string;

    @IsString()
    @IsOptional()
    buyerName?: string;

    @IsString()
    @IsOptional()
    buyerPhone?: string;

    @IsNumber()
    @IsOptional()
    salePrice?: number;

    @IsString()
    @IsOptional()
    soldAt?: string;

    @IsNumber()
    @IsOptional()
    onboardingStep?: number;
}

export class UpdateProjectDto {
    @IsString()
    @IsOptional()
    videoUrl?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsEnum(ProjectStatus)
    @IsOptional()
    status?: ProjectStatus;

    @IsNumber()
    @IsOptional()
    @Min(0)
    price?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    area?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    bedrooms?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    bathrooms?: number;

    @IsEnum(ProjectType)
    @IsOptional()
    projectType?: ProjectType;

    @IsString()
    @IsOptional()
    category?: string;

    @IsUUID()
    @IsOptional()
    cityId?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    cityName?: string;

    @IsString()
    @IsOptional()
    pincode?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    totalBuildings?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    totalUnits?: number;

    @IsString()
    @IsOptional()
    buyerName?: string;

    @IsString()
    @IsOptional()
    buyerPhone?: string;

    @IsNumber()
    @IsOptional()
    salePrice?: number;

    @IsString()
    @IsOptional()
    soldAt?: string;

    @IsNumber()
    @IsOptional()
    onboardingStep?: number;
}
