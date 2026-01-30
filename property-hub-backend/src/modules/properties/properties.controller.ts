import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto } from './properties.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RegionGuard } from '../../auth/guards/region.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { RequireRegion } from '../../common/decorators/require-region.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Controller('api/:region/properties')
@UseGuards(JwtAuthGuard, RolesGuard, RegionGuard)
@RequireRoles('central-authority', 'regional-manager', 'marketing-manager', 'commission-manager', 'property-onboarding-manager', 'property-partner', 'channel-partner', 'consultant')
@RequireRegion()
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) { }

    @Get()
    @RequireRoles('regional-manager', 'property-onboarding-manager', 'property-partner')
    findAll(
        @Param('region') region: string,
        @CurrentUser() user: AuthenticatedUser,
        @Query('myOnly') myOnly?: string
    ) {
        return this.propertiesService.findAll(user, region, myOnly === 'true');
    }

    @Get(':id')
    @RequireRoles('regional-manager', 'property-onboarding-manager', 'consultant', 'property-partner')
    findOne(
        @Param('region') region: string,
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.propertiesService.findOne(id, user);
    }

    @Post()
    @RequireRoles('regional-manager', 'property-onboarding-manager', 'property-partner')
    create(
        @Param('region') region: string,
        @Body() createPropertyDto: CreatePropertyDto,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.propertiesService.create(createPropertyDto, user);
    }

    @Patch(':id')
    @RequireRoles('regional-manager', 'property-onboarding-manager', 'property-partner')
    update(
        @Param('region') region: string,
        @Param('id') id: string,
        @Body() updatePropertyDto: UpdatePropertyDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.propertiesService.update(id, updatePropertyDto, user);
    }

    @Delete(':id')
    @RequireRoles('regional-manager', 'property-partner')
    remove(
        @Param('region') region: string,
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.propertiesService.remove(id, user);
    }
}
