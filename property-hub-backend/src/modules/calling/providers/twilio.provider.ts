import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CallingProvider, CallParams, CallResponse, CallProviderType } from '../calling.types';

@Injectable()
export class TwilioProvider implements CallingProvider {
    private readonly logger = new Logger(TwilioProvider.name);
    private readonly accountSid: string;
    private readonly authToken: string;
    private readonly twilioPhone: string;

    constructor(private configService: ConfigService) {
        this.accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
        this.authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
        this.twilioPhone = this.configService.get<string>('TWILIO_PHONE_NUMBER');
    }

    async makeCall(params: CallParams): Promise<CallResponse> {
        const { from, to } = params;
        
        if (!this.accountSid || !this.authToken || !this.twilioPhone) {
            throw new Error('Twilio credentials not configured');
        }

        const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
        const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Calls.json`;

        const body = new URLSearchParams();
        body.append('To', to); // Lead number
        body.append('From', this.twilioPhone); // Our Twilio number
        
        const appUrl = this.configService.get<string>('APP_URL');
        // Twilio requires a TwiML URL to execute call instructions
        body.append('Url', `${appUrl}/api/calling/twiml/connect?agent_number=${encodeURIComponent(from)}`);
        body.append('StatusCallback', `${appUrl}/api/calling/webhook/twilio`);

        try {
            const response = await axios.post(url, body, {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                timeout: 10000,
            });

            const sid = response.data?.sid;
            if (!sid) throw new Error('No sid received from Twilio');

            return { success: true, sid, provider: CallProviderType.TWILIO };
        } catch (error) {
            this.logger.error(`Twilio call failed: ${error.message}`);
            throw error;
        }
    }

    async getCallDetails(sid: string): Promise<any> {
        const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
        const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Calls/${sid}.json`;
        const response = await axios.get(url, { headers: { Authorization: `Basic ${auth}` } });
        return response.data;
    }
}
