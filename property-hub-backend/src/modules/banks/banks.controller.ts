import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { BanksService } from './banks.service';
import { CreateBankDto, UpdateBankDto } from './banks.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { UserRole } from '../../common/enums/role.enum';

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
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    findAll() {
        return this.banksService.findAllBanks();
    }

    @Post()
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    create(@Body() dto: CreateBankDto) {
        return this.banksService.createBank(dto);
    }

    @Patch(':id')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    update(@Param('id') id: string, @Body() dto: UpdateBankDto) {
        return this.banksService.updateBank(id, dto);
    }

    @Delete(':id')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    remove(@Param('id') id: string) {
        return this.banksService.deleteBank(id);
    }
}
