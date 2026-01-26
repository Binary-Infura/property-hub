import { Module } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { RegionsController } from './regions.controller';
import { PrismaService } from '../../database/prisma.service';
import { KeycloakModule } from '../../common/services/keycloak/keycloak.module';
import { KeycloakAdminService } from '../../common/services/keycloak/keycloak-admin.service';

@Module({
    imports: [KeycloakModule],
    controllers: [RegionsController],
    providers: [RegionsService, PrismaService, KeycloakAdminService],
    exports: [RegionsService],
})
export class RegionsModule { }
