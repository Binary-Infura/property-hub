import {
    Controller,
    Post,
    Patch,
    Body,
    Param,
    UseGuards,
    Headers,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import {
    CreateWebhookLeadDto,
    UpdateLeadStatusDto,
    NotificationDto,
    UpdateCampaignMetricsDto,
} from './webhooks.dto';
import { ApiKeyGuard } from '@/auth/guards/api-key.guard';

@Controller('webhooks')
@UseGuards(ApiKeyGuard)
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) { }

    @Post('leads')
    @HttpCode(HttpStatus.CREATED)
    async createLead(
        @Body() createLeadDto: CreateWebhookLeadDto,
        @Headers('x-idempotency-key') idempotencyKey?: string,
    ) {
        return this.webhooksService.createLead(createLeadDto, idempotencyKey);
    }

    @Patch('leads/:id/status')
    @HttpCode(HttpStatus.OK)
    async updateLeadStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateLeadStatusDto,
    ) {
        return this.webhooksService.updateLeadStatus(id, updateStatusDto);
    }

    @Post('notifications')
    @HttpCode(HttpStatus.OK)
    async handleNotification(
        @Body() notificationDto: NotificationDto,
    ) {
        return this.webhooksService.handleNotification(notificationDto);
    }

    @Post('campaign-metrics')
    @HttpCode(HttpStatus.OK)
    async updateCampaignMetrics(
        @Body() updateMetricsDto: UpdateCampaignMetricsDto,
    ) {
        return this.webhooksService.updateCampaignMetrics(updateMetricsDto);
    }
}
