import { Controller, Post, Body } from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { RegisterBuyerDto } from './buyers.dto';

@Controller('api/public/buyers')
export class PublicBuyersController {
    constructor(private readonly buyersService: BuyersService) { }

    @Post('signup')
    signup(@Body() dto: RegisterBuyerDto) {
        return this.buyersService.register(dto);
    }
}
