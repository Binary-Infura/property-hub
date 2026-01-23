import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto } from './leads.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RegionRoleGuard } from '../../auth/guards/region-role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequireRegionRole } from '../../common/decorators/region-roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Controller('api/:region/leads')
@UseGuards(JwtAuthGuard, RolesGuard, RegionRoleGuard)
@Roles('internal')
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) { }

    @Get()
    @RequireRegionRole('regional-manager', 'leads-manager')
    findAll(
        @Param('region') region: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.leadsService.findAll(user);
    }

    @Get(':id')
    @RequireRegionRole('regional-manager', 'leads-manager')
    findOne(
        @Param('region') region: string,
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.leadsService.findOne(id, user);
    }

    @Post()
    @RequireRegionRole('regional-manager', 'leads-manager')
    create(
        @Param('region') region: string,
        @Body() createLeadDto: CreateLeadDto
    ) {
        return this.leadsService.create(createLeadDto);
    }

    @Patch(':id')
    @RequireRegionRole('regional-manager', 'leads-manager')
    update(
        @Param('region') region: string,
        @Param('id') id: string,
        @Body() updateLeadDto: UpdateLeadDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.leadsService.update(id, updateLeadDto, user);
    }

    @Delete(':id')
    @RequireRegionRole('regional-manager')
    remove(
        @Param('region') region: string,
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.leadsService.remove(id, user);
    }
}
