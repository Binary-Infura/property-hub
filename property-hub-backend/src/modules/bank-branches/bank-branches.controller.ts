import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { BankBranchesService } from './bank-branches.service';
import { CreateBankBranchDto, UpdateBankBranchDto } from './bank-branches.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { UserRole } from '../../common/enums/role.enum';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/bank-branches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BankBranchesController {
    constructor(private readonly bankBranchesService: BankBranchesService) { }

    @Post()
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    create(@Body() createBankBranchDto: CreateBankBranchDto) {
        return this.bankBranchesService.create(createBankBranchDto);
    }

    @Get()
    @Public()
    findAll(
        @Query('bankId') bankId?: string,
        @Query('cityId') cityId?: string,
        @Query('isActive') isActive?: string
    ) {
        const isActiveBool = isActive !== undefined ? isActive === 'true' : undefined;
        return this.bankBranchesService.findAll({ bankId, cityId, isActive: isActiveBool });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bankBranchesService.findOne(id);
    }

    @Patch(':id')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    update(@Param('id') id: string, @Body() updateBankBranchDto: UpdateBankBranchDto) {
        return this.bankBranchesService.update(id, updateBankBranchDto);
    }

    @Delete(':id')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    remove(@Param('id') id: string) {
        return this.bankBranchesService.remove(id);
    }
}
