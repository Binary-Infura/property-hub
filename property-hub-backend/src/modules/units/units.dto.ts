import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitDto {
    @ApiProperty()
    @IsUUID()
    projectId: string;

    @ApiProperty()
    @IsString()
    unitNumber: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    floor?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    area?: number;

    @ApiProperty()
    @IsNumber()
    price: number;
}

export class UpdateUnitDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    unitNumber?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    floor?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    area?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    price?: number;
}

export class MarkUnitAsSoldDto {
    @ApiProperty()
    @IsString()
    buyerName: string;

    @ApiProperty()
    @IsString()
    buyerPhone: string;

    @ApiProperty()
    @IsNumber()
    salePrice: number;

    @ApiProperty()
    @IsDateString()
    soldAt: string;
}

export class UnitItemDto {
    @ApiProperty()
    @IsString()
    unitNumber: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    floor?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    area?: number;

    @ApiProperty()
    @IsNumber()
    price: number;
}

export class BulkCreateUnitsDto {
    @ApiProperty()
    @IsUUID()
    projectId: string;

    @ApiProperty({ type: [UnitItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UnitItemDto)
    units: UnitItemDto[];
}

export class BulkDeleteUnitsDto {
    @ApiProperty()
    ids: string[];
}
