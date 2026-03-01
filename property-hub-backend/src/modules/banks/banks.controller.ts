import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { BanksService } from './banks.service';
import { CreateBankDto, UpdateBankDto } from './banks.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';

@Controller('api/banks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BanksController {
    constructor(private readonly banksService: BanksService) { }

    @Public()
    @Get('active')
    findActive() {
        return this.banksService.findActiveBanks();
    }

    @Get()
    @RequireRoles('central-authority')
    findAll() {
        return this.banksService.findAllBanks();
    }

    @Post()
    @RequireRoles('central-authority')
    create(@Body() dto: CreateBankDto) {
        return this.banksService.createBank(dto);
    }

    @Patch(':id')
    @RequireRoles('central-authority')
    update(@Param('id') id: string, @Body() dto: UpdateBankDto) {
        return this.banksService.updateBank(id, dto);
    }

    @Delete(':id')
    @RequireRoles('central-authority')
    remove(@Param('id') id: string) {
        return this.banksService.deleteBank(id);
    }
}
