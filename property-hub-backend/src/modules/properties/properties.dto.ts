import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { PropertyStatus, PropertyType } from '@prisma/client';

export class CreatePropertyDto {
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


    @IsEnum(PropertyStatus)
    @IsOptional()
    status?: PropertyStatus;

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

    @IsEnum(PropertyType)
    propertyType: PropertyType;

    @IsString()
    @IsOptional()
    category?: string;

    @IsUUID()
    @IsOptional()
    cityId?: string;

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
}

export class UpdatePropertyDto {
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

    @IsEnum(PropertyStatus)
    @IsOptional()
    status?: PropertyStatus;

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

    @IsEnum(PropertyType)
    @IsOptional()
    propertyType?: PropertyType;

    @IsString()
    @IsOptional()
    category?: string;

    @IsUUID()
    @IsOptional()
    cityId?: string;

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
}
