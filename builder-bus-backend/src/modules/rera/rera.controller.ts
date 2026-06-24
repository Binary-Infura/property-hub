import { Controller, Post, Body, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ReraService } from './rera.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('RERA')
@Controller('rera')
@UseGuards(JwtAuthGuard)
export class ReraController {
    constructor(private readonly reraService: ReraService) { }

    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload RERA NDJSON data manually' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                state: { type: 'string' },
            },
        },
    })
    async uploadData(
        @Req() req: FastifyRequest,
        @CurrentUser() user: AuthenticatedUser
    ) {
        const data = await (req as any).file();
        if (!data) {
            throw new Error('File is required');
        }

        const state = data.fields?.state?.value || 'Unknown';
        const fileBuffer = await data.toBuffer();
        const fileContent = fileBuffer.toString('utf-8');

        return await this.reraService.uploadReraData(fileContent, state, user);
    }

    @Get('projects')
    @ApiOperation({ summary: 'Get RERA projects' })
    async getProjects(
        @Query('state') state?: string,
        @Query('district') district?: string,
        @Query('search') search?: string,
        @Query('limit') limit?: number
    ) {
        return await this.reraService.getProjects(state, district, search, limit);
    }

    @Get('projects/:state')
    @ApiOperation({ summary: 'Get RERA projects for a specific state' })
    async getProjectsByState(
        @Param('state') state: string,
        @Query('district') district?: string,
        @Query('search') search?: string,
        @Query('limit') limit?: number
    ) {
        return await this.reraService.getProjects(state, district, search, limit);
    }

    @Get('districts/:state')
    @ApiOperation({ summary: 'Get unique districts for a state' })
    async getDistricts(@Param('state') state: string) {
        return await this.reraService.getUniqueDistricts(state);
    }

    @Post('import/:id')
    @ApiOperation({ summary: 'Import a RERA project into Property Hub' })
    async importProject(
        @Param('id') projectId: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return await this.reraService.importProject(projectId, user);
    }

    @Get('district-counts')
    @ApiOperation({ summary: 'Get district-wise project counts' })
    async getDistrictCounts(
        @Query('state') state?: string,
        @Query('district') district?: string
    ) {
        return await this.reraService.getDistrictCounts(state, district);
    }
}
