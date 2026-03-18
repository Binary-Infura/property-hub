import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SpatialExplorerService } from './spatial-explorer.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/spatial-explorer')
export class SpatialExplorerController {
    constructor(private readonly explorerService: SpatialExplorerService) {}

    /**
     * Endpoint for retrieving the full spatial state of a project.
     * Publicly accessible for the search/property pages.
     */
    @Public()
    @Get('project/:projectId')
    async getSpatialData(@Param('projectId') projectId: string) {
        return this.explorerService.getProjectSpatialData(projectId);
    }

    /**
     * Endpoint specifically for units, ensuring the explorer can fetch 
     * the entire building inventory without standard pagination.
     */
    @Public()
    @Get('project/:projectId/units')
    async getExplorerUnits(@Param('projectId') projectId: string) {
        return this.explorerService.getExplorerUnits(projectId);
    }
}
