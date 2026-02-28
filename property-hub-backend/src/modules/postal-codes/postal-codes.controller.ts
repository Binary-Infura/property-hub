import { Controller, Get, Query, UseGuards, Param, Req } from '@nestjs/common';
import { PostalCodesService } from './postal-codes.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/postal-codes')
@UseGuards(AuthGuard('jwt'))
export class PostalCodesController {
    constructor(private readonly postalCodesService: PostalCodesService) { }

    @Get()
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        const pageNum = page ? Number(page) : 1;
        const limitNum = limit ? Number(limit) : 20;
        return this.postalCodesService.findAll(pageNum, limitNum, search);
    }

    @Get(':code')
    async findByCode(@Param('code') code: string) {
        return this.postalCodesService.findByCode(code);
    }

    @Get('sync/start')
    async sync(
        @Query('offset') offset?: string,
        @Query('limit') limit?: string,
    ) {
        const offsetNum = offset ? Number(offset) : 0;
        const limitNum = limit ? Number(limit) : 100;
        return this.postalCodesService.syncFromApi(offsetNum, limitNum);
    }

    @Get('sync/progress')
    async getProgress() {
        return this.postalCodesService.getSyncProgress();
    }

    @Get('sync/logs')
    async getSyncLogs(@Query('limit') limit?: string) {
        return this.postalCodesService.getSyncLogs(limit ? Number(limit) : 20);
    }

    @Get('sync/full')
    async startFullSync(@Req() req: any) {
        return this.postalCodesService.startFullSync(req.user?.id);
    }
}
