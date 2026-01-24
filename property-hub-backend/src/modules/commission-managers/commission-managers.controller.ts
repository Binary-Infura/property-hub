import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CommissionManagersService } from './commission-managers.service';
import { CreateCommissionManagerDto } from './commission-managers.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';

@Controller('api/commission-managers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommissionManagersController {
    constructor(private readonly commissionManagersService: CommissionManagersService) { }

    @Post()
    @RequireRoles('central-authority', 'super-admin')
    create(@Body() dto: CreateCommissionManagerDto) {
        return this.commissionManagersService.create(dto);
    }

    @Get()
    @RequireRoles('central-authority', 'super-admin')
    findAll() {
        return this.commissionManagersService.findAll();
    }
}
