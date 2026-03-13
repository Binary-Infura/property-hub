import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);

    constructor(private configService: ConfigService) { }

    /**
     * Send WhatsApp text message using Meta Graph API
     * USES WHATSAPP_PHONE_NUMBER_ID for the URL as per Meta documentation
     */
    async sendMessage(to: string, text: string) {
        const accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');
        const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
        const baseUrl = this.configService.get<string>('FB_GRAPH_API_BASE_URL') || 'https://graph.facebook.com/v23.0';

        if (!accessToken || !phoneNumberId) {
            this.logger.error('WhatsApp configuration missing (Access Token or Phone Number ID)');
            return { success: false, error: 'Config missing' };
        }

        try {
            const response = await axios.post(
                `${baseUrl}/${phoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: this.formatPhoneNumber(to),
                    type: 'text',
                    text: {
                        preview_url: true,
                        body: text
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return { success: true, data: response.data };
        } catch (error: any) {
            const errorData = error?.response?.data;
            this.logger.error('WhatsApp Send Error:', errorData || error.message);
            return {
                success: false,
                error: errorData?.error?.message || error.message
            };
        }
    }

    /**
     * Specialized function to send video call invitation
     */
    async sendVideoCallLink(phoneNumber: string, leadName: string, videoCallLink: string) {
        const message = `Hi ${leadName},\n\nYou are invited to a video call based on your property inquiry. Please join using the following link:\n\n${videoCallLink}\n\nThank you!`;

        const result = await this.sendMessage(phoneNumber, message);

        if (!result.success) {
            throw new InternalServerErrorException(result.error);
        }

        return result;
    }

    private formatPhoneNumber(phoneNumber: string): string {
        let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
        if (cleanPhone.length === 10) {
            cleanPhone = `91${cleanPhone}`; // Default to India format
        }
        return cleanPhone;
    }

    async sendInvitationWhatsApp(phoneNumber: string, roles: string[], inviteLink: string) {
        const rolesList = roles.map(r => r.replace(/_/g, ' ')).join(', ');
        const message = `Welcome to Property Hub!\n\nYou have been invited to join the platform as ${rolesList}. Please complete your registration using the link below:\n\n${inviteLink}\n\nThis link will expire in 48 hours.\n\nThank you!`;

        const result = await this.sendMessage(phoneNumber, message);

        if (!result.success) {
            throw new InternalServerErrorException(result.error);
        }

        return result;
    }
}
