import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
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
}
