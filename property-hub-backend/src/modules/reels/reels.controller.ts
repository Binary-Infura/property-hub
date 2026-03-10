import { Controller, Get, Post, Delete, Body, Param, UseGuards, Query, Put } from '@nestjs/common';
import { ReelsService } from './reels.service';
import { CreateReelDto, UpdateReelInstagramDto } from './reels.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { UserRole } from '../../common/enums/role.enum';
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
    @ApiQuery({ name: 'projectId', required: false, type: String })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('projectId') projectId?: string,
    ) {
        return this.reelsService.findAll(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 8,
            projectId,
        );
    }

    @Get('my')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get my reels' })
    findMyReels(@CurrentUser() user: AuthenticatedUser) {
        return this.reelsService.findByUser(user.userId);
    }

    @Get('moderation/pending')
    @UseGuards(JwtAuthGuard)
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get pending reels for moderation' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getPendingForModeration(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.reelsService.getPendingReelsForModeration(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 10,
        );
    }

    @Get(':id/moderation')
    @UseGuards(JwtAuthGuard)
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get reel details for moderation' })
    getReelForModeration(@Param('id') id: string) {
        return this.reelsService.getReelForModeration(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @RequireRoles(UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new reel' })
    create(@Body() createReelDto: CreateReelDto, @CurrentUser() user: AuthenticatedUser) {
        return this.reelsService.create(createReelDto, user);
    }

    @Put(':id/instagram')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update reel Instagram settings' })
    updateInstagram(
        @Param('id') id: string,
        @Body() updateDto: UpdateReelInstagramDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.reelsService.updateInstagramSettings(id, updateDto, user);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a reel' })
    remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        return this.reelsService.remove(id, user);
    }
}
