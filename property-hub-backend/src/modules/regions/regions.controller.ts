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
import { RegionsService } from './regions.service';
import { CreateRegionDto, UpdateRegionDto } from './regions.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';

@Controller('api/regions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegionsController {
    constructor(private readonly regionsService: RegionsService) { }

    @Get()
    findAll() {
        return this.regionsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.regionsService.findOne(id);
    }

    @Post()
    @RequireRoles('central-authority')
    create(@Body() createRegionDto: CreateRegionDto) {
        return this.regionsService.create(createRegionDto);
    }

    @Patch(':id')
    @RequireRoles('central-authority')
    update(@Param('id') id: string, @Body() updateRegionDto: UpdateRegionDto) {
        return this.regionsService.update(id, updateRegionDto);
    }

    @Delete(':id')
    @RequireRoles('central-authority')
    remove(@Param('id') id: string) {
        return this.regionsService.remove(id);
    }
}
