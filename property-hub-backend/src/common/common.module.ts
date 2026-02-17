import { Module, Global } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegionGuard } from '../auth/guards/region.guard';
import { PrismaService } from '../database/prisma.service';

/**
 * CommonModule provides generic, non-business logic shared across modules.
 * This includes global-ready guards, decorators, and generic DTOs.
 */
@Global()
@Module({
    imports: [],
    providers: [
        RolesGuard,
        JwtAuthGuard,
        RegionGuard,
        PrismaService,
    ],
    exports: [
        RolesGuard,
        JwtAuthGuard,
        RegionGuard,
        PrismaService,
    ],
})
export class CommonModule { }
