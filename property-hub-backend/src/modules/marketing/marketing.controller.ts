import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { CreateCampaignDto, UpdateCampaignDto } from './marketing.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { UserRole } from '../../common/enums/role.enum';

@ApiTags('marketing')
@Controller('api/marketing/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MarketingController {
    constructor(private readonly marketingService: MarketingService) { }

    @Post()
    @RequireRoles(UserRole.MARKETING_MANAGER, UserRole.CENTRAL_AUTHORITY)
    @ApiOperation({ summary: 'Create a new marketing campaign' })
    create(@Body() createCampaignDto: CreateCampaignDto) {
        return this.marketingService.create(createCampaignDto);
    }

    @Get()
    @RequireRoles(UserRole.MARKETING_MANAGER, UserRole.CENTRAL_AUTHORITY)
    @ApiOperation({ summary: 'Get all marketing campaigns' })
    findAll() {
        return this.marketingService.findAll();
    }

    @Get(':id')
    @RequireRoles(UserRole.MARKETING_MANAGER, UserRole.CENTRAL_AUTHORITY)
    @ApiOperation({ summary: 'Get a marketing campaign by id' })
    findOne(@Param('id') id: string) {
        return this.marketingService.findOne(id);
    }

    @Patch(':id')
    @RequireRoles(UserRole.MARKETING_MANAGER, UserRole.CENTRAL_AUTHORITY)
    @ApiOperation({ summary: 'Update a marketing campaign' })
    update(@Param('id') id: string, @Body() updateCampaignDto: UpdateCampaignDto) {
        return this.marketingService.update(id, updateCampaignDto);
    }

    @Delete(':id')
    @RequireRoles(UserRole.MARKETING_MANAGER, UserRole.CENTRAL_AUTHORITY)
    @ApiOperation({ summary: 'Delete a marketing campaign' })
    remove(@Param('id') id: string) {
        return this.marketingService.remove(id);
    }
}
