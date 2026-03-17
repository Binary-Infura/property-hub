import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto, UpdateUnitDto, MarkUnitAsSoldDto, BulkCreateUnitsDto, BulkDeleteUnitsDto } from './units.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { UserRole } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/units')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UnitsController {
    constructor(private readonly unitsService: UnitsService) { }

    @Post()
    @RequireRoles(UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY)
    create(@Body() createUnitDto: CreateUnitDto, @CurrentUser() user: AuthenticatedUser) {
        return this.unitsService.create(createUnitDto, user);
    }

    @Post('bulk')
    @RequireRoles(UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY)
    createBulk(@Body() bulkCreateUnitsDto: BulkCreateUnitsDto, @CurrentUser() user: AuthenticatedUser) {
        return this.unitsService.createBulk(bulkCreateUnitsDto, user);
    }

    @Delete('bulk')
    @RequireRoles(UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY)
    removeBulk(@Body() bulkDeleteUnitsDto: BulkDeleteUnitsDto, @CurrentUser() user: AuthenticatedUser) {
        return this.unitsService.removeBulk(bulkDeleteUnitsDto.ids, user);
    }

    @Get('project/:projectId')
    @Public()
    findByProject(
        @Param('projectId') projectId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.unitsService.findByProject(projectId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 12);
    }

    @Get(':id')
    @Public()
    findOne(@Param('id') id: string) {
        return this.unitsService.findOne(id);
    }

    @Patch(':id')
    @RequireRoles(UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY)
    update(
        @Param('id') id: string,
        @Body() updateUnitDto: UpdateUnitDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.unitsService.update(id, updateUnitDto, user);
    }

    @Patch(':id/sold')
    @RequireRoles(UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY)
    markAsSold(
        @Param('id') id: string,
        @Body() markUnitAsSoldDto: MarkUnitAsSoldDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.unitsService.markAsSold(id, markUnitAsSoldDto, user);
    }

    @Get('my')
    @RequireRoles(UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY)
    findMyUnits(
        @CurrentUser() user: AuthenticatedUser,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('status') status?: string,
    ) {
        return this.unitsService.findMyUnits(
            user, 
            page ? parseInt(page) : 1, 
            limit ? parseInt(limit) : 12,
            search,
            status
        );
    }

    @Delete(':id')
    @RequireRoles(UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY)
    remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        return this.unitsService.remove(id, user);
    }
}
