import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegionDto {
    @ApiProperty({ example: 'mumbai-west', description: 'Unique code for the region' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ example: 'Mumbai West', description: 'Display name of the region' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: true, description: 'Whether the region is active', required: false })
    @IsBoolean()
    @IsOptional()
    active?: boolean;
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
}

// Enum for role types that are assignable to regions
export enum ManagerRole {
    REGIONAL = 'regional-manager',
    MARKETING = 'marketing-manager',
    COMMISSION = 'commission-manager',
    ONBOARDING = 'property-onboarding-manager',
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
    search?: string; // Search by user name or email
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
    assignedUsers: AssignedUserDto[];
}

export class AssignedUserDto {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    status: string;
}
