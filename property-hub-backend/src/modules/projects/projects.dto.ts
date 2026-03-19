import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';
import { ProjectStatus, ProjectType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateAddressDto {
    @IsString()
    line1: string;

    @IsString()
    @IsOptional()
    line2?: string;

    @IsString()
    @IsOptional()
    pincode?: string;

    @IsNumber()
    @IsOptional()
    latitude?: number;

    @IsNumber()
    @IsOptional()
    longitude?: number;

    @IsString()
    @IsOptional()
    googlePlaceId?: string;

    @IsUUID()
    cityId: string;
}

export class UpdateAddressDto {
    @IsString()
    @IsOptional()
    line1?: string;

    @IsString()
    @IsOptional()
    line2?: string;

    @IsString()
    @IsOptional()
    pincode?: string;

    @IsNumber()
    @IsOptional()
    latitude?: number;

    @IsNumber()
    @IsOptional()
    longitude?: number;

    @IsString()
    @IsOptional()
    googlePlaceId?: string;

    @IsUUID()
    @IsOptional()
    cityId?: string;
}

export class CreateProjectDto {


    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;


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

    @IsNumber()
    @IsOptional()
    @Min(0)
    totalTowers?: number;

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

    @IsString({ each: true })
    @IsOptional()
    amenities?: string[];

    @IsString({ each: true })
    @IsOptional()
    highlights?: string[];

    @IsString({ each: true })
    @IsOptional()
    images?: string[];

    @IsOptional()
    @ValidateNested()
    @Type(() => CreateAddressDto)
    addressRecord?: CreateAddressDto;
}

export class UpdateProjectDto {


    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

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

    @IsNumber()
    @IsOptional()
    @Min(0)
    totalTowers?: number;

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

    @IsString({ each: true })
    @IsOptional()
    amenities?: string[];

    @IsString({ each: true })
    @IsOptional()
    highlights?: string[];

    @IsString({ each: true })
    @IsOptional()
    images?: string[];

    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateAddressDto)
    addressRecord?: UpdateAddressDto;
}
