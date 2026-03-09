import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ExotelService {
    private readonly logger = new Logger(ExotelService.name);
    private readonly apiKey: string;
    private readonly apiToken: string;
    private readonly accountSid: string;
    private readonly callerId: string;
    private readonly baseUrl: string;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        this.apiKey = this.configService.get<string>('EXOTEL_API_KEY');
        this.apiToken = this.configService.get<string>('EXOTEL_API_TOKEN');
        this.accountSid = this.configService.get<string>('EXOTEL_ACCOUNT_SID');
        this.callerId = this.configService.get<string>('EXOTEL_CALLER_ID');
        this.baseUrl = `https://api.exotel.com/v1/Accounts/${this.accountSid}/Calls/connect.json`;
    }

    async makeCall(from: string, to: string, leadId: string, consultantId: string) {
        try {
            // Validate credentials before making the call
            if (!this.apiKey || !this.apiToken || !this.accountSid || !this.callerId) {
                const missingCredentials = [];
                if (!this.apiKey) missingCredentials.push('EXOTEL_API_KEY');
                if (!this.apiToken) missingCredentials.push('EXOTEL_API_TOKEN');
                if (!this.accountSid) missingCredentials.push('EXOTEL_ACCOUNT_SID');
                if (!this.callerId) missingCredentials.push('EXOTEL_CALLER_ID');
                throw new Error(`Exotel credentials not configured: ${missingCredentials.join(', ')}. Please set these in your .env file.`);
            }

            // Validate phone numbers are present
            if (!from || !to) {
                throw new Error(`Invalid phone numbers: from="${from}", to="${to}"`);
            }

            // Basic Auth Header
            const auth = Buffer.from(`${this.apiKey}:${this.apiToken}`).toString('base64');

            // Prepare request body
            const params = new URLSearchParams();
            params.append('From', this.formatPhoneNumber(from));
            params.append('To', this.formatPhoneNumber(to));
            params.append('CallerId', this.formatPhoneNumber(this.callerId));
            params.append('CallType', 'trans');
            params.append('Record', 'true');

            const appUrl = this.configService.get<string>('APP_URL');
            if (appUrl) {
                const callbackUrl = `${appUrl}/api/exotel/webhook`;
                params.append('StatusCallback', callbackUrl);
            }

            this.logger.log(`Initiating call from ${from} to ${to} for lead ${leadId}`);
            this.logger.debug(`Exotel Request Params: ${params.toString()}`);

            const response = await axios.post(this.baseUrl, params, {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                timeout: 10000, // 10 second timeout
            });

            const sid = response.data?.Call?.Sid;
            
            if (!sid) {
                throw new Error(`No call SID received from Exotel. Response: ${JSON.stringify(response.data)}`);
            }

            // Create initial call log
            await this.prisma.callLog.create({
                data: {
                    sid,
                    leadId,
                    consultantId,
                    status: 'queued',
                },
            });

            return { success: true, sid };
        } catch (error) {
            const errorData = error.response?.data;
            const errorMessage = typeof errorData === 'string' ? errorData : JSON.stringify(errorData || error.message);
            const statusCode = error.response?.status;
            
            this.logger.error(`Exotel call failed ${statusCode ? `(status ${statusCode})` : ''}: ${errorMessage}`);

            // Re-throw with more context
            throw new Error(`Exotel API Error: ${errorMessage}`);
        }
    }

    private formatPhoneNumber(phone: string): string {
        const cleaned = phone.trim().replace(/\D/g, '');
        // Already in E.164 Indian format (91 + 10 digits = 12 digits)
        if (cleaned.length === 12 && cleaned.startsWith('91')) {
            return `+${cleaned}`;
        }
        // Indian local format with 0 prefix (0 + 10 digits = 11 digits)
        if (cleaned.length === 11 && cleaned.startsWith('0')) {
            return `+91${cleaned.substring(1)}`;
        }
        // Plain 10-digit Indian mobile number
        if (cleaned.length === 10) {
            return `+91${cleaned}`;
        }
        // Fallback: if already has +, return as-is; otherwise add +
        return phone.startsWith('+') ? phone.trim() : `+${cleaned}`;
    }

    async handleWebhook(data: any) {
        const { CallSid, Status, RecordingUrl, RecordingDuration } = data;

        if (!CallSid) return;

        await this.prisma.callLog.updateMany({
            where: { sid: CallSid },
            data: {
                status: Status,
                recordingUrl: RecordingUrl,
                duration: RecordingDuration ? parseInt(RecordingDuration) : undefined,
                endTime: Status === 'completed' ? new Date() : undefined,
            },
        });
    }

    async getCallDetails(sid: string) {
        try {
            const auth = Buffer.from(`${this.apiKey}:${this.apiToken}`).toString('base64');
            const url = `https://api.exotel.com/v1/Accounts/${this.accountSid}/Calls/${sid}.json`;
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            });
            return response.data?.Call;
        } catch (error) {
            this.logger.error(`Failed to fetch Exotel call details for SID ${sid}: ${error.message}`);
            return null;
        }
    }
}
