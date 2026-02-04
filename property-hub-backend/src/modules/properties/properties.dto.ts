import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { PropertyStatus, PropertyType } from '@prisma/client';

export class CreatePropertyDto {
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

    @IsUUID()
    @IsOptional()
    regionId?: string;

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

    @IsString()
    @IsOptional()
    city?: string;

    @IsUUID()
    @IsOptional()
    onboardedById?: string;
}

export class UpdatePropertyDto {
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

    @IsString()
    @IsOptional()
    city?: string;
}
