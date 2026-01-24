import { IsEmail, IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateRegionalManagerDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    regionIds?: string[];
}

export class RegionalManagerDto {
    id: string;
    keycloakId: string | null;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    regions: any[]; // will be Region[]
    stats?: {
        propertiesCount: number;
        leadsCount: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
