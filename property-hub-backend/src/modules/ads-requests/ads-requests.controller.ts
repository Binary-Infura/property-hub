import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdsRequestsService } from './ads-requests.service';
import { CreateAdsRequestDto, UpdateAdsRequestDto } from './ads-requests.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('ads-requests')
@Controller('api/ads-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdsRequestsController {
    constructor(private readonly adsRequestsService: AdsRequestsService) { }

    @Post()
    @RequireRoles('property-partner', 'marketing-manager', 'central-authority')
    @ApiOperation({ summary: 'Create a new ads request' })
    create(
        @Body() createAdsRequestDto: CreateAdsRequestDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.adsRequestsService.create(createAdsRequestDto, user.userId);
    }

    @Get()
    @RequireRoles('property-partner', 'marketing-manager', 'central-authority')
    @ApiOperation({ summary: 'Get all ads requests' })
    findAll(@CurrentUser() user: AuthenticatedUser) {
        return this.adsRequestsService.findAll(user.roles?.[0], user.userId);
    }

    @Get(':id')
    @RequireRoles('property-partner', 'marketing-manager', 'central-authority')
    @ApiOperation({ summary: 'Get an ads request by id' })
    findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        return this.adsRequestsService.findOne(id, user.roles?.[0], user.userId);
    }

    @Patch(':id')
    @RequireRoles('property-partner', 'marketing-manager', 'central-authority')
    @ApiOperation({ summary: 'Update an ads request' })
    update(
        @Param('id') id: string,
        @Body() updateAdsRequestDto: UpdateAdsRequestDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.adsRequestsService.update(id, updateAdsRequestDto, user.roles?.[0], user.userId);
    }

    @Delete(':id')
    @RequireRoles('property-partner', 'marketing-manager', 'central-authority')
    @ApiOperation({ summary: 'Delete an ads request' })
    remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        return this.adsRequestsService.remove(id, user.roles?.[0], user.userId);
    }
}
