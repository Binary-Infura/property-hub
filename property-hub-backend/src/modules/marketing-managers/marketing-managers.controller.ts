import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { MarketingManagersService } from './marketing-managers.service';
import { CreateMarketingManagerDto } from './marketing-managers.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';

@Controller('api/marketing-managers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarketingManagersController {
    constructor(private readonly marketingManagersService: MarketingManagersService) { }

    @Post()
    @RequireRoles('central-authority', 'super-admin')
    create(@Body() dto: CreateMarketingManagerDto) {
        return this.marketingManagersService.create(dto);
    }

    @Get()
    @RequireRoles('central-authority', 'super-admin')
    findAll() {
        return this.marketingManagersService.findAll();
    }
}
