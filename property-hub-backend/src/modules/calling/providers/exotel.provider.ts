import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CallingProvider, CallParams, CallResponse, CallProviderType } from '../calling.types';

@Injectable()
export class ExotelBusinessProvider implements CallingProvider {
    private readonly logger = new Logger(ExotelBusinessProvider.name);
    private readonly apiKey: string;
    private readonly apiToken: string;
    private readonly accountSid: string;
    private readonly callerId: string;
    private readonly baseUrl: string;

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('EXOTEL_API_KEY');
        this.apiToken = this.configService.get<string>('EXOTEL_API_TOKEN');
        this.accountSid = this.configService.get<string>('EXOTEL_ACCOUNT_SID');
        this.callerId = this.configService.get<string>('EXOTEL_CALLER_ID');
        this.baseUrl = `https://api.exotel.com/v1/Accounts/${this.accountSid}/Calls/connect.json`;
    }

    async makeCall(params: CallParams): Promise<CallResponse> {
        const { from, to, leadId } = params;
        
        if (!this.apiKey || !this.apiToken || !this.accountSid || !this.callerId) {
            throw new Error('Exotel credentials not configured');
        }

        const auth = Buffer.from(`${this.apiKey}:${this.apiToken}`).toString('base64');
        const searchParams = new URLSearchParams();
        searchParams.append('From', this.formatPhoneNumber(from));
        searchParams.append('To', this.formatPhoneNumber(to));
        searchParams.append('CallerId', this.formatPhoneNumber(this.callerId));
        searchParams.append('CallType', 'trans');
        searchParams.append('Record', 'true');

        const appUrl = this.configService.get<string>('APP_URL');
        if (appUrl) {
            searchParams.append('StatusCallback', `${appUrl}/api/calling/webhook/exotel`);
        }

        try {
            const response = await axios.post(this.baseUrl, searchParams, {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                timeout: 10000,
            });

            const sid = response.data?.Call?.Sid;
            if (!sid) throw new Error('No sid received from Exotel');

            return { success: true, sid, provider: CallProviderType.EXOTEL };
        } catch (error) {
            this.logger.error(`Exotel call failed: ${error.message}`);
            throw error;
        }
    }

    async getCallDetails(sid: string): Promise<any> {
        const auth = Buffer.from(`${this.apiKey}:${this.apiToken}`).toString('base64');
        const url = `https://api.exotel.com/v1/Accounts/${this.accountSid}/Calls/${sid}.json`;
        const response = await axios.get(url, { headers: { Authorization: `Basic ${auth}` } });
        return response.data?.Call;
    }

    private formatPhoneNumber(phone: string): string {
        const cleaned = phone.trim().replace(/\D/g, '');
        if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`;
        if (cleaned.length === 11 && cleaned.startsWith('0')) return `+91${cleaned.substring(1)}`;
        if (cleaned.length === 10) return `+91${cleaned}`;
        return phone.startsWith('+') ? phone.trim() : `+${cleaned}`;
    }
}
