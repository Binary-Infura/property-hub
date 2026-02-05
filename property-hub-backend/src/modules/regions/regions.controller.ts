import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { RegionsService } from './regions.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import {
    CreateRegionDto,
    UpdateRegionDto,
    GetRegionAllocationsQueryDto,
    GetAllRegionsQueryDto,
    AssignRegionDto,
    UpdateRegionAssignmentDto,
    ManagerRole,
} from './regions.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Query } from '@nestjs/common';

@Controller('api/regions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegionsController {
    constructor(private readonly regionsService: RegionsService) { }

    @Get()
    @Public()
    findAll(@Query() query: GetAllRegionsQueryDto) {
        return this.regionsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.regionsService.findOne(id);
    }

    @Post()
    @RequireRoles('central-authority')
    create(@Body() createRegionDto: CreateRegionDto) {
        return this.regionsService.create(createRegionDto);
    }

    @Patch(':id')
    @RequireRoles('central-authority')
    update(@Param('id') id: string, @Body() updateRegionDto: UpdateRegionDto) {
        return this.regionsService.update(id, updateRegionDto);
    }

    @Delete(':id')
    @RequireRoles('central-authority')
    remove(@Param('id') id: string) {
        return this.regionsService.remove(id);
    }

    // --- Region Allocation Endpoints ---

    @Get('allocations/all')
    @RequireRoles('central-authority')
    getAllocations(@Query() filters: GetRegionAllocationsQueryDto) {
        return this.regionsService.getAllocations(filters);
    }

    @Get('allocations/users/search')
    @RequireRoles('central-authority')
    searchUsers(
        @Query('query') query: string,
        @Query('role') role?: ManagerRole,
    ) {
        return this.regionsService.searchUsers(query, role);
    }

    @Post('allocations/assign')
    @RequireRoles('central-authority')
    assignUserToRegions(@Body() dto: AssignRegionDto) {
        return this.regionsService.assignUserToRegions(dto);
    }

    @Patch('allocations/:userId')
    @RequireRoles('central-authority')
    updateAssignment(
        @Param('userId') userId: string,
        @Body() dto: UpdateRegionAssignmentDto,
    ) {
        return this.regionsService.updateAssignment(userId, dto);
    }

    @Delete('allocations/:userId/regions/:regionId')
    @RequireRoles('central-authority')
    removeAssignment(
        @Param('userId') userId: string,
        @Param('regionId') regionId: string,
    ) {
        return this.regionsService.removeAssignment(userId, regionId);
    }
}
