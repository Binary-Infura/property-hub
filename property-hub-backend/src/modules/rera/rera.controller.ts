import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReraService } from './rera.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('RERA')
@Controller('rera')
@UseGuards(JwtAuthGuard)
export class ReraController {
    constructor(private readonly reraService: ReraService) { }

    @Post('sync')
    @ApiOperation({ summary: 'Trigger RERA sync for all states' })
    async syncAll() {
        await this.reraService.syncAllStates();
        return { message: 'Sync jobs queued for all states' };
    }

    @Post('sync/:state')
    @ApiOperation({ summary: 'Trigger RERA sync for a specific state' })
    async syncState(@Param('state') state: string, @Body() body: { district?: string }) {
        return await this.reraService.syncState(state, body?.district);
    }

    @Get('projects')
    @ApiOperation({ summary: 'Get scraped RERA projects' })
    async getProjects(
        @Query('state') state?: string,
        @Query('district') district?: string,
        @Query('search') search?: string,
        @Query('limit') limit?: number
    ) {
        return await this.reraService.getProjects(state, district, search, limit);
    }

    @Get('projects/:state')
    @ApiOperation({ summary: 'Get scraped RERA projects for a specific state' })
    async getProjectsByState(
        @Param('state') state: string,
        @Query('district') district?: string,
        @Query('search') search?: string,
        @Query('limit') limit?: number
    ) {
        return await this.reraService.getProjects(state, district, search, limit);
    }

    @Get('districts/:state')
    @ApiOperation({ summary: 'Get unique districts for a state' })
    async getDistricts(@Param('state') state: string) {
        return await this.reraService.getUniqueDistricts(state);
    }

    @Post('import/:id')
    @ApiOperation({ summary: 'Import a RERA project as a project' })
    async importProject(
        @Param('id') projectId: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return await this.reraService.importProject(projectId, user);
    }

    @Post('count/:state')
    @ApiOperation({ summary: 'Get total project count from RERA portal' })
    async getCount(@Param('state') state: string, @Body() body: { district?: string }) {
        return { count: await this.reraService.getTotalCount(state, body?.district) };
    }

    @Get('logs')
    @ApiOperation({ summary: 'Get RERA sync activity logs' })
    async getLogs() {
        return await this.reraService.getActivityLogs();
    }

    @Get('district-counts')
    @ApiOperation({ summary: 'Get stored district-wise project counts' })
    async getDistrictCounts(@Query('state') state?: string) {
        return await this.reraService.getDistrictCounts(state);
    }

    @Post('sync-district-counts/:state')
    @ApiOperation({ summary: 'Trigger RERA total count sync for all districts in a state' })
    async syncDistrictCounts(@Param('state') state: string) {
        return await this.reraService.syncDistrictCounts(state);
    }
}
