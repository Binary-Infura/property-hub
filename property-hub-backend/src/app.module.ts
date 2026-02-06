import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { LeadsModule } from './modules/leads/leads.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { UsersModule } from './modules/users/users.module';
import { RegionsModule } from './modules/regions/regions.module';
import { KeycloakModule } from './common/services/keycloak/keycloak.module';
import { MattermostModule } from './common/services/mattermost/mattermost.module';
import { CommissionManagersModule } from './modules/roles/commission-managers/commission-managers.module';
import { MarketingManagersModule } from './modules/roles/marketing-managers/marketing-managers.module';
import { RegionalManagersModule } from './modules/roles/regional-managers/regional-managers.module';
import { BuyersModule } from './modules/roles/buyers/buyers.module';
import { ConsultantsModule } from './modules/roles/consultants/consultants.module';
import { PropertyPartnersModule } from './modules/roles/property-partners/property-partners.module';
import { ChannelPartnersModule } from './modules/roles/channel-partners/channel-partners.module';

import { CentralAuthorityModule } from './modules/roles/central-authority/central-authority.module';
import { ChatModule } from './modules/chat/chat.module';
import { PrismaService } from './database/prisma.service';
import { LocationsModule } from './modules/locations/locations.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UploadsModule } from './modules/uploads/uploads.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { AdsRequestsModule } from './modules/ads-requests/ads-requests.module';
import { join } from 'path';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        CommonModule,
        KeycloakModule,
        MattermostModule,
        AuthModule,
        PropertiesModule,
        LeadsModule,
        CommissionsModule,
        UsersModule,
        RegionsModule,
        RegionalManagersModule,
        MarketingManagersModule,
        CommissionManagersModule,
        BuyersModule,
        ConsultantsModule,
        PropertyPartnersModule,
        ChannelPartnersModule,

        CentralAuthorityModule,
        ChatModule,
        LocationsModule,
        UploadsModule,
        MarketingModule,
        AdsRequestsModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'uploads'),
            serveRoot: '/uploads',
        }),
    ],
})
export class AppModule { }
