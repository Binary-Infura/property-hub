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
    state: string;
}

export class CityResponseDto {
    id: string;
    cityName: string;
    stateCode: string;
    assignedAt: Date;
}
