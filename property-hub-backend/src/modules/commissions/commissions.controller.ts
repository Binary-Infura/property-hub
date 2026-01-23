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
import { CommissionsService } from './commissions.service';
import { CreateCommissionDto, UpdateCommissionDto } from './commissions.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RegionRoleGuard } from '../../auth/guards/region-role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequireRegionRole } from '../../common/decorators/region-roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Controller('api/:region/commissions')
@UseGuards(JwtAuthGuard, RolesGuard, RegionRoleGuard)
@Roles('internal')
export class CommissionsController {
    constructor(private readonly commissionsService: CommissionsService) { }

    @Get()
    @RequireRegionRole('commission-manager', 'regional-manager')
    findAll(
        @Param('region') region: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.commissionsService.findAll(user);
    }

    @Get(':id')
    @RequireRegionRole('commission-manager', 'regional-manager')
    findOne(
        @Param('region') region: string,
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.commissionsService.findOne(id, user);
    }

    @Post()
    @RequireRegionRole('commission-manager')
    create(
        @Param('region') region: string,
        @Body() createCommissionDto: CreateCommissionDto,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.commissionsService.create(createCommissionDto, user);
    }

    @Patch(':id')
    @RequireRegionRole('commission-manager')
    update(
        @Param('region') region: string,
        @Param('id') id: string,
        @Body() updateCommissionDto: UpdateCommissionDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.commissionsService.update(id, updateCommissionDto, user);
    }

    @Delete(':id')
    @RequireRegionRole('commission-manager')
    remove(
        @Param('region') region: string,
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.commissionsService.remove(id, user);
    }
}
