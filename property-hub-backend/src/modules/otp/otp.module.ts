import { Module, Global } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { MailModule } from '../mail/mail.module';

@Global()
@Module({
    imports: [WhatsappModule, MailModule],
    providers: [OtpService],
    controllers: [OtpController],
    exports: [OtpService],
})
export class OtpModule { }
