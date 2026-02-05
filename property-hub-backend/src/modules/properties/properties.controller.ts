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
@RequireRoles('central-authority', 'regional-manager', 'marketing-manager', 'commission-manager', 'onboarding-manager', 'property-partner', 'channel-partner', 'consultant', 'buyer', 'loan-adviser', 'visit-executive', 'service-provider')
@RequireRegion()
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) { }

    @Get()
    @RequireRoles('central-authority', 'regional-manager', 'marketing-manager', 'commission-manager', 'onboarding-manager', 'property-partner', 'channel-partner', 'consultant', 'buyer', 'loan-adviser', 'visit-executive', 'service-provider')
    findAll(
        @Param('region') region: string,
        @CurrentUser() user: AuthenticatedUser,
        @Query('myOnly') myOnly?: string,
        @Query('city') city?: string
    ) {
        return this.propertiesService.findAll(user, region, myOnly === 'true', city);
    }

    @Get(':id')
    @RequireRoles('central-authority', 'regional-manager', 'marketing-manager', 'commission-manager', 'onboarding-manager', 'property-partner', 'channel-partner', 'consultant', 'buyer', 'loan-adviser', 'visit-executive', 'service-provider')
    findOne(
        @Param('region') region: string,
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.propertiesService.findOne(id, user);
    }

    @Post()
    @RequireRoles('regional-manager', 'onboarding-manager', 'property-partner')
    create(
        @Param('region') region: string,
        @Body() createPropertyDto: CreatePropertyDto,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.propertiesService.create(createPropertyDto, user);
    }

    @Patch(':id')
    @RequireRoles('regional-manager', 'onboarding-manager', 'property-partner')
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
