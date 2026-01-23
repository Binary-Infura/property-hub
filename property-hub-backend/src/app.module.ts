import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { LeadsModule } from './modules/leads/leads.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaService } from './database/prisma.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        AuthModule,
        PropertiesModule,
        LeadsModule,
        CommissionsModule,
        UsersModule,
    ],
    providers: [PrismaService],
})
export class AppModule { }
