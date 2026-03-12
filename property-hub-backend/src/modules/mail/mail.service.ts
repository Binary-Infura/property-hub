import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'Property Hub');
      const fromEmail = this.configService.get<string>('SMTP_FROM_EMAIL');

      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  async sendVideoCallInvitation(to: string, leadName: string, videoCallLink: string) {
    const subject = 'Video Call Invitation - Property Hub';
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
        <h2 style="color: #1a1a1a; margin-top: 0;">Hello ${leadName},</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">You have been invited to a video call for your property inquiry.</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Please click the button below to join the call:</p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${videoCallLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; display: inline-block;">Join Video Call</a>
        </div>
        
        <p style="font-size: 13px; line-height: 1.5; color: #9ca3af; margin-top: 30px;">If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="font-size: 12px; color: #2563eb; word-break: break-all; background-color: #f8fafc; padding: 12px; border-radius: 8px; border: 1px dashed #e2e8f0;">${videoCallLink}</p>
        
        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} Property Hub. All rights reserved.</p>
      </div>
    `;

    return this.sendMail(to, subject, html);
  }
}
