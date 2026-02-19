import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { LeadsModule } from './modules/leads/leads.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { UsersModule } from './modules/users/users.module';

import { MattermostModule } from './common/services/mattermost/mattermost.module';
import { CommissionManagersModule } from './modules/roles/commission-managers/commission-managers.module';
import { MarketingManagersModule } from './modules/roles/marketing-managers/marketing-managers.module';
import { BuyersModule } from './modules/roles/buyers/buyers.module';
import { ConsultantsModule } from './modules/roles/consultants/consultants.module';
import { PropertyPartnersModule } from './modules/roles/property-partners/property-partners.module';
import { DsaModule } from './modules/roles/dsa/dsa.module';

import { CentralAuthorityModule } from './modules/roles/central-authority/central-authority.module';
import { ChatModule } from './modules/chat/chat.module';
import { PrismaService } from './database/prisma.service';
import { DatabaseModule } from './database/database.module';
import { LocationsModule } from './modules/locations/locations.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UploadsModule } from './modules/uploads/uploads.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { AdsRequestsModule } from './modules/ads-requests/ads-requests.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { PostalCodesModule } from './modules/postal-codes/postal-codes.module';
import { ReraModule } from './modules/rera/rera.module';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379', 10),
            },
        }),
        ScheduleModule.forRoot(),
        DatabaseModule,
        CommonModule,
        MattermostModule,
        AuthModule,
        PropertiesModule,
        LeadsModule,
        CommissionsModule,
        UsersModule,

        MarketingManagersModule,
        CommissionManagersModule,
        BuyersModule,
        ConsultantsModule,
        PropertyPartnersModule,
        DsaModule,

        CentralAuthorityModule,
        ChatModule,
        LocationsModule,
        UploadsModule,
        MarketingModule,
        AdsRequestsModule,
        WebhooksModule,
        PostalCodesModule,
        ReraModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'uploads'),
            serveRoot: '/uploads',
        }),
    ],
})
export class AppModule { }
