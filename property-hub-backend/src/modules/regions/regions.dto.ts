import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegionDto {
    @ApiProperty({ example: 'mumbai-west', description: 'Unique code for the region', required: false })
    @IsString()
    @IsOptional()
    code?: string;

    @ApiProperty({ example: 'Mumbai West', description: 'Display name of the region' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    @IsOptional()
    active?: boolean;

    @ApiProperty({ example: 'Asia', description: 'Continent name', required: false })
    @IsString()
    @IsOptional()
    continent?: string;

    @ApiProperty({ example: 'India', description: 'Country name', required: false })
    @IsString()
    @IsOptional()
    country?: string;

    @ApiProperty({ example: 'Maharashtra', description: 'State name', required: false })
    @IsString()
    @IsOptional()
    state?: string;

    @ApiProperty({ example: 'Mumbai', description: 'City name', required: false })
    @IsString()
    @IsOptional()
    city?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: '400050', description: 'Postal code for the region', required: false })
    @IsString()
    @IsOptional()
    postalCode?: string;

    @ApiProperty({ example: ['400050', '400051'], description: 'Array of postal codes covered by this region', required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    postalCodes?: string[];

    @IsString()
    @IsOptional()
    countryCode?: string;

    @IsString()
    @IsOptional()
    stateCode?: string;

    @IsString()
    @IsOptional()
    cityCode?: string;
}

export class UpdateRegionDto {
    @ApiProperty({ example: 'Mumbai West', description: 'Display name of the region', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: true, description: 'Whether the region is active', required: false })
    @IsBoolean()
    @IsOptional()
    active?: boolean;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    continent?: string;

    @IsString()
    @IsOptional()
    country?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    postalCode?: string;
}

export class GetAllRegionsQueryDto {
    @IsOptional()
    @IsString()
    page?: string;

    @IsOptional()
    @IsString()
    limit?: string;

    @IsOptional()
    @IsString()
    continent?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    search?: string;
}

// Enum for role types that are assignable to regions
export enum ManagerRole {
    REGIONAL = 'regional-manager',
    MARKETING = 'marketing-manager',
    COMMISSION = 'commission-manager',
    ONBOARDING = 'onboarding-manager',
}

// Query DTO for filtering region allocations
export class GetRegionAllocationsQueryDto {
    @IsOptional()
    @IsEnum(ManagerRole)
    role?: ManagerRole;

    @IsOptional()
    @IsString()
    regionId?: string;

    @IsOptional()
    @IsString()
    continent?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    search?: string; // Search by user name or email

    @IsOptional()
    @IsString()
    page?: string;

    @IsOptional()
    @IsString()
    limit?: string;
}

// DTO for assigning users to regions
export class AssignRegionDto {
    @IsString()
    userId: string;

    @IsArray()
    @IsString({ each: true })
    regionIds: string[];
}

// DTO for updating region assignments
export class UpdateRegionAssignmentDto {
    @IsArray()
    @IsString({ each: true })
    regionIds: string[];
}

// Response DTO for region allocation
export class RegionAllocationResponseDto {
    id: string;
    name: string;
    code: string;
    active: boolean;
    country?: string;
    state?: string;
    city?: string;
    assignedUsers: AssignedUserDto[];
}

export class RegionPaginatedAllocationResponseDto {
    data: RegionAllocationResponseDto[];
    total: number;
}

export class AssignedUserDto {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    role: string;
    status: string;
}
