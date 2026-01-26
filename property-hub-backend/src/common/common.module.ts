import { Module, Global } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../database/prisma.service';
import { KeycloakModule } from './services/keycloak/keycloak.module';

/**
 * CommonModule provides generic, non-business logic shared across modules.
 * This includes global-ready guards, decorators, and generic DTOs.
 */
@Global()
@Module({
    imports: [
        KeycloakModule,
    ],
    providers: [
        RolesGuard,
        JwtAuthGuard,
        PrismaService,
    ],
    exports: [
        RolesGuard,
        JwtAuthGuard,
        PrismaService,
        KeycloakModule,
    ],
})
export class CommonModule { }
