import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { MailModule } from '../mail/mail.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { UsersModule } from '../users/users.module';
import { PrismaService } from '../../database/prisma.service';

@Module({
  imports: [MailModule, WhatsappModule, UsersModule],
  controllers: [InvitationsController],
  providers: [InvitationsService, PrismaService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
