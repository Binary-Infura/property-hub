import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ExotelService } from './exotel.service';

@Controller('api/exotel')
export class ExotelController {
    constructor(private readonly exotelService: ExotelService) { }

    @Post('webhook')
    @HttpCode(200)
    async handleWebhook(@Body() data: any) {
        await this.exotelService.handleWebhook(data);
        return { status: 'ok' };
    }
}
