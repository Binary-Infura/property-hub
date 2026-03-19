import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './cities.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { UserRole } from '../../common/enums/role.enum';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Controller('api/cities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CitiesController {
    constructor(private readonly citiesService: CitiesService) { }

    @Get('managed')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    getManaged(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('state') state?: string
    ) {
        return this.citiesService.getManagedCities(+page, +limit, state);
    }

    @Get()
    findAll() {
        return this.citiesService.findAllCities();
    }

    @Post()
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    createCity(@Body() dto: CreateCityDto) {
        return this.citiesService.createCity(dto);
    }

    @Patch(':id')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    updateCity(@Param('id') id: string, @Body() dto: any) {
        return this.citiesService.updateCity(id, dto);
    }

    @Delete(':id')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    deleteCity(@Param('id') id: string) {
        return this.citiesService.deleteCity(id);
    }

    @Get('india/states')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.PROPERTY_PARTNER)
    getStates() {
        return this.citiesService.getIndianStates();
    }

    @Get('india/:stateCode/cities')
    getCities(@Param('stateCode') stateCode: string) {
        return this.citiesService.getCitiesOfState(stateCode);
    }

}
