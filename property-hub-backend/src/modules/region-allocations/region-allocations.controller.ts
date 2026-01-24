import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { RegionAllocationsService } from './region-allocations.service';
import {
    GetRegionAllocationsQueryDto,
    AssignRegionDto,
    UpdateRegionAssignmentDto,
    ManagerRole,
} from './region-allocations.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';

@Controller('api/region-allocations')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles('central-authority')
export class RegionAllocationsController {
    constructor(private readonly regionAllocationsService: RegionAllocationsService) { }

    @Get()
    getAllocations(@Query() filters: GetRegionAllocationsQueryDto) {
        return this.regionAllocationsService.getAllocations(filters);
    }

    @Get('users/search')
    searchUsers(
        @Query('query') query: string,
        @Query('role') role?: ManagerRole,
    ) {
        return this.regionAllocationsService.searchUsers(query, role);
    }

    @Post('assign')
    assignUserToRegions(@Body() dto: AssignRegionDto) {
        return this.regionAllocationsService.assignUserToRegions(dto);
    }

    @Patch(':userId')
    updateAssignment(
        @Param('userId') userId: string,
        @Body() dto: UpdateRegionAssignmentDto,
    ) {
        return this.regionAllocationsService.updateAssignment(userId, dto);
    }

    @Delete(':userId/regions/:regionId')
    removeAssignment(
        @Param('userId') userId: string,
        @Param('regionId') regionId: string,
    ) {
        return this.regionAllocationsService.removeAssignment(userId, regionId);
    }
}
