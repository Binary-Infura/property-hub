import { Controller, Get, Param } from '@nestjs/common';
import { SpatialExplorerService } from './spatial-explorer.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/spatial-explorer')
export class SpatialExplorerController {
    constructor(private readonly explorerService: SpatialExplorerService) {}

    /**
     * Lightweight summary: project + towers + slim unit arrays.
     * Slim units only carry: id, unitNumber, floor, status, towerId.
     * Called once on initial page load — fast, minimal payload.
     */
    @Public()
    @Get('project/:projectId/summary')
    async getProjectSummary(@Param('projectId') projectId: string) {
        return this.explorerService.getProjectSummary(projectId);
    }

    /**
     * On-demand: full details for a single unit.
     * Called when the user clicks a unit in the 3D explorer.
     */
    @Public()
    @Get('project/:projectId/unit/:unitId')
    async getUnitDetail(
        @Param('projectId') projectId: string,
        @Param('unitId') unitId: string,
    ) {
        return this.explorerService.getUnitDetail(projectId, unitId);
    }

    /**
     * Full spatial data (legacy — kept for backward compat).
     */
    @Public()
    @Get('project/:projectId')
    async getSpatialData(@Param('projectId') projectId: string) {
        return this.explorerService.getProjectSpatialData(projectId);
    }

    /**
     * All units unpaginated (legacy — kept for backward compat).
     */
    @Public()
    @Get('project/:projectId/units')
    async getExplorerUnits(@Param('projectId') projectId: string) {
        return this.explorerService.getExplorerUnits(projectId);
    }
}
