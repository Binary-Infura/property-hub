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
    async syncState(@Param('state') state: string) {
        // We call syncState directly for manual immediate trigger from API
        // Or we could queue it. For responsiveness, we queue it.
        // However, the user might want immediate result for a single state.
        // Let's queue it to follow the architecture.
        return await this.reraService.syncState(state);
    }
}
