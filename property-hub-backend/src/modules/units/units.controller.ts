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
import { UnitsService } from './units.service';
import { CreateUnitDto, UpdateUnitDto, MarkUnitAsSoldDto } from './units.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/units')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UnitsController {
    constructor(private readonly unitsService: UnitsService) { }

    @Post()
    @RequireRoles('onboarding-manager', 'property-partner', 'broker', 'central-authority')
    create(@Body() createUnitDto: CreateUnitDto, @CurrentUser() user: AuthenticatedUser) {
        return this.unitsService.create(createUnitDto, user);
    }

    @Get('project/:projectId')
    @Public()
    findByProject(@Param('projectId') projectId: string) {
        return this.unitsService.findByProject(projectId);
    }

    @Get(':id')
    @Public()
    findOne(@Param('id') id: string) {
        return this.unitsService.findOne(id);
    }

    @Patch(':id')
    @RequireRoles('onboarding-manager', 'property-partner', 'broker', 'central-authority')
    update(
        @Param('id') id: string,
        @Body() updateUnitDto: UpdateUnitDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.unitsService.update(id, updateUnitDto, user);
    }

    @Patch(':id/sold')
    @RequireRoles('onboarding-manager', 'property-partner', 'broker', 'central-authority')
    markAsSold(
        @Param('id') id: string,
        @Body() markUnitAsSoldDto: MarkUnitAsSoldDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.unitsService.markAsSold(id, markUnitAsSoldDto, user);
    }

    @Delete(':id')
    @RequireRoles('property-partner', 'central-authority')
    remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        return this.unitsService.remove(id, user);
    }
}
