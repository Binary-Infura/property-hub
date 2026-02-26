import { IsString, IsNotEmpty } from 'class-validator';

export class AssignCityDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    stateCode: string;

    @IsString()
    @IsNotEmpty()
    cityName: string;
}

export class CreateCityDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    cityCode: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    country: string;

    @IsString()
    @IsNotEmpty()
    continent: string;

    @IsString()
    description?: string;

    @IsString({ each: true })
    tags?: string[];
}

export class CityResponseDto {
    id: string;
    cityName: string;
    stateCode: string;
    assignedAt: Date;
}
