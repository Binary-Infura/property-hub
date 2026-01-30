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
import { RegionGuard } from '../../auth/guards/region.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { RequireRegion } from '../../common/decorators/require-region.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Controller('api/:region/commissions')
@UseGuards(JwtAuthGuard, RolesGuard, RegionGuard)
@RequireRoles('central-authority', 'regional-manager', 'marketing-manager', 'commission-manager', 'property-onboarding-manager', 'property-partner', 'channel-partner', 'consultant')
@RequireRegion()
export class CommissionsController {
    constructor(private readonly commissionsService: CommissionsService) { }

    @Get()
    @RequireRoles('commission-manager', 'regional-manager')
    findAll(
        @Param('region') region: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.commissionsService.findAll(user);
    }

    @Get(':id')
    @RequireRoles('commission-manager', 'regional-manager')
    findOne(
        @Param('region') region: string,
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.commissionsService.findOne(id, user);
    }

    @Post()
    @RequireRoles('commission-manager')
    create(
        @Param('region') region: string,
        @Body() createCommissionDto: CreateCommissionDto,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.commissionsService.create(createCommissionDto, user);
    }

    @Patch(':id')
    @RequireRoles('commission-manager')
    update(
        @Param('region') region: string,
        @Param('id') id: string,
        @Body() updateCommissionDto: UpdateCommissionDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.commissionsService.update(id, updateCommissionDto, user);
    }

    @Delete(':id')
    @RequireRoles('commission-manager')
    remove(
        @Param('region') region: string,
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.commissionsService.remove(id, user);
    }
}
