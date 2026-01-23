import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { LeadsModule } from './modules/leads/leads.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { UsersModule } from './modules/users/users.module';
import { RegionsModule } from './modules/regions/regions.module';
import { KeycloakModule } from './modules/keycloak/keycloak.module';
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
    ],
    providers: [PrismaService],
})
export class AppModule { }
