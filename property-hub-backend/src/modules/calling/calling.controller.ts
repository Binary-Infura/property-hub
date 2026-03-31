import { Controller, Post, Get, Body, Req, Query, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { CallingService } from './calling.service';
import { CallProviderType } from './calling.types';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Calling')
@Controller('api/calling')
export class CallingController {
    constructor(private readonly callingService: CallingService) { }

    @Post('webhook/exotel')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Exotel Call Webhook' })
    async handleExotelWebhook(@Body() body: any) {
        return this.callingService.handleProviderWebhook(CallProviderType.EXOTEL, body);
    }

    @Post('webhook/twilio')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Twilio Call Webhook' })
    async handleTwilioWebhook(@Body() body: any) {
        return this.callingService.handleProviderWebhook(CallProviderType.TWILIO, body);
    }

    @Post('webhook/knowlarity')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Knowlarity Call Webhook' })
    async handleKnowlarityWebhook(@Body() body: any) {
        return this.callingService.handleProviderWebhook(CallProviderType.KNOWLARITY, body);
    }

    @Get('twiml/connect')
    @ApiOperation({ summary: 'Twilio TwiML for connecting agent and customer' })
    async getTwimlConnect(@Query('agent_number') agentNumber: string, @Res() res: any) {
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial>${agentNumber}</Dial>
</Response>`;
        res.set('Content-Type', 'text/xml');
        res.send(twiml);
    }
}
