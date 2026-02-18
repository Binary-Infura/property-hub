import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ReraService } from './rera.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('RERA')
@Controller('rera')
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
    async getProjects(@Param('state') state?: string) {
        return await this.reraService.getProjects(state);
    }

    @Get('projects/:state')
    @ApiOperation({ summary: 'Get scraped RERA projects for a specific state' })
    async getProjectsByState(@Param('state') state: string) {
        return await this.reraService.getProjects(state);
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
}
