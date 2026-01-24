import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';

// Enum for role types
export enum ManagerRole {
    REGIONAL = 'regional-manager',
    MARKETING = 'marketing-manager',
    COMMISSION = 'commission-manager',
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
