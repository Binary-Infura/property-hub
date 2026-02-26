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
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Controller('api/properties')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles('central-authority', 'marketing-manager', 'onboarding-manager', 'property-partner', 'channel-partner', 'consultant', 'buyer', 'loan-adviser', 'visit-executive', 'service-provider')
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) { }

    @Get('my')
    findAllMy(
        @CurrentUser() user: AuthenticatedUser,
        @Query('city') city?: string
    ) {
        return this.propertiesService.findAll(user, true, city);
    }

    @Get()
    @Public()
    findAll(
        @CurrentUser() user: AuthenticatedUser,
        @Query('city') city?: string
    ) {
        return this.propertiesService.findAll(user, false, city);
    }

    @Get(':id')
    @Public()
    findOne(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.propertiesService.findOne(id, user);
    }

    @Post()
    @RequireRoles('onboarding-manager', 'property-partner')
    create(
        @Body() createPropertyDto: CreatePropertyDto,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.propertiesService.create(createPropertyDto, user);
    }

    @Patch(':id')
    @RequireRoles('onboarding-manager', 'property-partner')
    update(
        @Param('id') id: string,
        @Body() updatePropertyDto: UpdatePropertyDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.propertiesService.update(id, updatePropertyDto, user);
    }

    @Delete(':id')
    @RequireRoles('property-partner')
    remove(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.propertiesService.remove(id, user);
    }
}
