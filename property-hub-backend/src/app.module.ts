import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { LeadsModule } from './modules/leads/leads.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { UsersModule } from './modules/users/users.module';
import { RegionsModule } from './modules/regions/regions.module';
import { KeycloakModule } from './modules/keycloak/keycloak.module';
import { GlobalUsersModule } from './modules/global-users/global-users.module';
import { CommissionManagersModule } from './modules/commission-managers/commission-managers.module';
import { MarketingManagersModule } from './modules/marketing-managers/marketing-managers.module';
import { RegionalManagersModule } from './modules/regional-managers/regional-managers.module';
import { RegionAllocationsModule } from './modules/region-allocations/region-allocations.module';
import { PrismaService } from './database/prisma.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        KeycloakModule,
        AuthModule,
        PropertiesModule,
        LeadsModule,
        CommissionsModule,
        UsersModule,
        RegionsModule,
        RegionAllocationsModule,
        RegionalManagersModule,
        MarketingManagersModule,
        GlobalUsersModule,
        CommissionManagersModule,
    ],
    providers: [PrismaService],
})
export class AppModule { }
