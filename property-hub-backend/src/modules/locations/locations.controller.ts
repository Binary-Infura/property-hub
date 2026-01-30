import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('api/locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) { }

  @Get('continents')
  getContinents() {
    return this.locationsService.getContinents();
  }

  @Get('countries')
  getCountries(@Query('continent') continent?: string) {
    return this.locationsService.getCountries(continent);
  }

  @Get('states/:countryCode')
  getStates(@Param('countryCode') countryCode: string) {
    return this.locationsService.getStates(countryCode);
  }

  @Get('cities/:countryCode/:stateCode')
  getCities(
    @Param('countryCode') countryCode: string,
    @Param('stateCode') stateCode: string
  ) {
    return this.locationsService.getCities(countryCode, stateCode);
  }
}
