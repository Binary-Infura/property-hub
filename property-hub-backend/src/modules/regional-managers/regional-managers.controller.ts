import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RegionalManagersService } from './regional-managers.service';
import { CreateRegionalManagerDto } from './regional-managers.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';

@Controller('api/regional-managers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegionalManagersController {
    constructor(private readonly regionalManagersService: RegionalManagersService) { }

    @Post()
    @RequireRoles('central-authority', 'super-admin')
    create(@Body() createRegionalManagerDto: CreateRegionalManagerDto) {
        return this.regionalManagersService.create(createRegionalManagerDto);
    }

    @Get()
    @RequireRoles('central-authority', 'super-admin')
    findAll() {
        return this.regionalManagersService.findAll();
    }
}
