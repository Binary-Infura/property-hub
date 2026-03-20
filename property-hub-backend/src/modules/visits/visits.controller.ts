import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { CreateVisitDto, UpdateVisitDto } from './visits.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Controller('api/visits')
@UseGuards(JwtAuthGuard)
export class VisitsController {
    constructor(private readonly visitsService: VisitsService) { }

    @Get()
    findAll(@CurrentUser() user: AuthenticatedUser) {
        return this.visitsService.findAll(user);
    }

    /**
     * Finds visit executives for a specific project
     */
    @Get('executives')
    findExecutivesForProject(@Query('projectId') projectId: string) {
        return this.visitsService.findExecutivesForProject(projectId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        return this.visitsService.findOne(id, user);
    }

    @Post()
    create(@Body() createVisitDto: CreateVisitDto) {
        return this.visitsService.create(createVisitDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateVisitDto: UpdateVisitDto) {
        return this.visitsService.update(id, updateVisitDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.visitsService.remove(id);
    }
}
