import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { AssignCityDto, CreateCityDto } from './cities.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Controller('api/cities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CitiesController {
    constructor(private readonly citiesService: CitiesService) { }

    @Get('managed')
    @RequireRoles('central-authority')
    getManaged(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10'
    ) {
        return this.citiesService.getManagedCities(+page, +limit);
    }

    @Get()
    findAll() {
        return this.citiesService.findAllCities();
    }

    @Post()
    @RequireRoles('central-authority')
    createCity(@Body() dto: CreateCityDto) {
        return this.citiesService.createCity(dto);
    }

    @Patch(':id')
    @RequireRoles('central-authority')
    updateCity(@Param('id') id: string, @Body() dto: any) {
        return this.citiesService.updateCity(id, dto);
    }

    @Delete(':id')
    @RequireRoles('central-authority')
    deleteCity(@Param('id') id: string) {
        return this.citiesService.deleteCity(id);
    }

    @Get('india/states')
    @RequireRoles('central-authority')
    getStates() {
        return this.citiesService.getIndianStates();
    }

    @Get('india/:stateCode/cities')
    getCities(@Param('stateCode') stateCode: string) {
        return this.citiesService.getCitiesOfState(stateCode);
    }

    @Get('allocations/all')
    @RequireRoles('central-authority')
    getAllAllocations() {
        return this.citiesService.getAllAllocations();
    }

    @Get('allocations/:userId')
    @RequireRoles('central-authority')
    getUserAllocations(@Param('userId') userId: string) {
        return this.citiesService.getUserAllocations(userId);
    }

    @Post('allocations/assign')
    @RequireRoles('central-authority')
    assign(@Body() dto: AssignCityDto) {
        return this.citiesService.assignCity(dto);
    }

    @Delete('allocations/:id')
    @RequireRoles('central-authority')
    unassign(@Param('id') id: string) {
        return this.citiesService.unassignCity(id);
    }

    @Get('allocations/my-cities')
    getMyCities(@CurrentUser() user: AuthenticatedUser) {
        return this.citiesService.getUserAllocations(user.userId);
    }

    @Get('allocations/users/search')
    @RequireRoles('central-authority')
    searchUsers(@Query('q') query: string) {
        return this.citiesService.searchManagers(query || '');
    }
}
