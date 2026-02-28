import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';

@Controller('api/activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogsController {
    constructor(private readonly activityLogsService: ActivityLogsService) { }

    @Get()
    @RequireRoles('central-authority')
    async getRecent(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20'
    ) {
        return this.activityLogsService.getRecentLogs(Number(page), Number(limit));
    }
}
