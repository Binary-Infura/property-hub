import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { GlobalUsersService } from './global-users.service';
import { CreateGlobalUserDto } from './global-users.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';

@Controller('api/global-users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GlobalUsersController {
    constructor(private readonly globalUsersService: GlobalUsersService) { }

    @Post()
    @RequireRoles('central-authority', 'super-admin')
    create(@Body() dto: CreateGlobalUserDto) {
        return this.globalUsersService.create(dto);
    }

    @Get()
    @RequireRoles('central-authority', 'super-admin')
    findAll() {
        return this.globalUsersService.findAll();
    }
}
