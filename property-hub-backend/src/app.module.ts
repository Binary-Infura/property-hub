import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { UnitsModule } from './modules/units/units.module';
import { LeadsModule } from './modules/leads/leads.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { UsersModule } from './modules/users/users.module';

import { GrowthPartnersModule } from './modules/roles/growth-partners/growth-partners.module';
import { BuyersModule } from './modules/roles/buyers/buyers.module';
import { ConsultantsModule } from './modules/roles/consultants/consultants.module';
import { PropertyPartnersModule } from './modules/roles/property-partners/property-partners.module';

import { CentralAuthorityModule } from './modules/roles/central-authority/central-authority.module';
import { ChatModule } from './modules/chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UploadsModule } from './modules/uploads/uploads.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { AdsRequestsModule } from './modules/ads-requests/ads-requests.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { PostalCodesModule } from './modules/postal-codes/postal-codes.module';
import { ReraModule } from './modules/rera/rera.module';
import { CitiesModule } from './modules/cities/cities.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { BanksModule } from './modules/banks/banks.module';
import { ReelsModule } from './modules/reels/reels.module';
import { InstagramModule } from './modules/instagram/instagram.module';
import { LoansModule } from './modules/loans/loans.module';
import { LivekitModule } from './modules/livekit/livekit.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { MailModule } from './modules/mail/mail.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { TowersModule } from './modules/towers/towers.module';
import { VisitsModule } from './modules/visits/visits.module';
import { CallingModule } from './modules/calling/calling.module';
import { join } from 'path';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        DatabaseModule,
        CommonModule,
        AuthModule,
        ProjectsModule,
        UnitsModule,
        LeadsModule,
        CommissionsModule,
        UsersModule,

        GrowthPartnersModule,
        BuyersModule,
        ConsultantsModule,
        PropertyPartnersModule,

        CentralAuthorityModule,
        ChatModule,
        UploadsModule,
        MarketingModule,
        AdsRequestsModule,
        WebhooksModule,
        PostalCodesModule,
        ReraModule,
        CitiesModule,
        ActivityLogsModule,
        BanksModule,
        ReelsModule,
        InstagramModule,
        LoansModule,
        CallingModule,
        LivekitModule,
        ReviewsModule,
        WhatsappModule,
        MailModule,
        InvitationsModule,
        PaymentsModule,
        OrganizationsModule,
        TowersModule,

        VisitsModule,
        /*
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'uploads'),
            serveRoot: '/uploads',
        }),
        */
    ],
})
export class AppModule { }
