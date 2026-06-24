import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { MailService } from '../mail/mail.service';
import { SendOtpDto, VerifyOtpDto } from './otp.dto';

@Injectable()
export class OtpService {
    private readonly logger = new Logger(OtpService.name);

    constructor(
        private prisma: PrismaService,
        private whatsappService: WhatsappService,
        private mailService: MailService,
    ) { }

    async sendOtp(dto: SendOtpDto) {
        if (!dto.phone && !dto.email) {
            throw new BadRequestException('Either phone or email is required');
        }

        if (dto.checkExists) {
            const user = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        dto.phone ? { phone: dto.phone } : null,
                        dto.email ? { email: dto.email } : null,
                    ].filter(Boolean) as any,
                },
            });

            if (!user) {
                throw new BadRequestException('User not found. Please enquiry or register first.');
            }
        }

        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);

        try {
            await this.prisma.oneTimePassword.create({
                data: {
                    phone: dto.phone,
                    email: dto.email,
                    code,
                    expiresAt,
                },
            });

            const results = [];

            if (dto.phone) {
                const message = `Your Builder Bus verification code is: ${code}. Valid for 5 minutes.`;
                const whatsappResult = await this.whatsappService.sendMessage(dto.phone, message);
                results.push({ type: 'whatsapp', success: whatsappResult.success });
            }

            if (dto.email) {
                const subject = 'Your Builder Bus Verification Code';
                const html = `
                    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #2563eb;">Builder Bus Verification</h2>
                        <p>Use the following code to verify your identity:</p>
                        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; color: #1e293b;">
                            ${code}
                        </div>
                        <p style="color: #64748b; font-size: 14px;">This code will expire in 5 minutes.</p>
                    </div>
                `;
                const mailResult = await this.mailService.sendMail(dto.email, subject, html);
                results.push({ type: 'email', success: mailResult.success });
            }

            return { success: true, message: 'OTP sent successfully', results };
        } catch (error) {
            this.logger.error('Failed to send OTP:', error);
            throw new InternalServerErrorException('Failed to process OTP request');
        }
    }

    async verifyOtp(dto: VerifyOtpDto) {
        const otpRecord = await this.prisma.oneTimePassword.findFirst({
            where: {
                OR: [
                    dto.phone ? { phone: dto.phone } : null,
                    dto.email ? { email: dto.email } : null,
                ].filter(Boolean) as any,
                code: dto.code,
                used: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!otpRecord) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        if (dto.consume !== false) {
            await this.prisma.oneTimePassword.update({
                where: { id: otpRecord.id },
                data: { used: true },
            });
        }

        return { success: true, message: 'OTP verified successfully' };
    }
}
