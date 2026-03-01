import { Controller, Get, Post, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ReelsService } from './reels.service';
import { CreateReelDto } from './reels.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('reels')
@Controller('api/reels')
export class ReelsController {
    constructor(private readonly reelsService: ReelsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all reels (paginated)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.reelsService.findAll(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 8,
        );
    }

    @Get('my')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get my reels' })
    findMyReels(@CurrentUser() user: AuthenticatedUser) {
        return this.reelsService.findByUser(user.userId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @RequireRoles('property-partner', 'admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new reel' })
    create(@Body() createReelDto: CreateReelDto, @CurrentUser() user: AuthenticatedUser) {
        return this.reelsService.create(createReelDto, user);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a reel' })
    remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        return this.reelsService.remove(id, user);
    }
}
