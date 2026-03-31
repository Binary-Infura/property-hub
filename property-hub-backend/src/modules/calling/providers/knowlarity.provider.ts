import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CallingProvider, CallParams, CallResponse, CallProviderType } from '../calling.types';

@Injectable()
export class KnowlarityProvider implements CallingProvider {
    private readonly logger = new Logger(KnowlarityProvider.name);
    private readonly apiKey: string;
    private readonly srNumber: string;
    private readonly baseUrl = 'https://kapi.knowlarity.com/v1/agent/outbound/click2call';

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('KNOWLARITY_API_KEY');
        this.srNumber = this.configService.get<string>('KNOWLARITY_SR_NUMBER');
    }

    async makeCall(params: CallParams): Promise<CallResponse> {
        const { from, to } = params;
        
        if (!this.apiKey || !this.srNumber) {
            throw new Error('Knowlarity credentials not configured');
        }

        try {
            const response = await axios.post(this.baseUrl, {
                agent_number: from,
                customer_number: to,
                caller_id: this.srNumber
            }, {
                headers: {
                    'x-api-key': this.apiKey,
                    'Authorization': this.apiKey, 
                    'Content-Type': 'application/json'
                }
            });

            const sid = response.data?.call_id || response.data?.request_id;
            if (!sid) throw new Error('No call ID received from Knowlarity');

            return { success: true, sid, provider: CallProviderType.KNOWLARITY };
        } catch (error) {
            this.logger.error(`Knowlarity call failed: ${error.message}`);
            throw error;
        }
    }

    async getCallDetails(sid: string): Promise<any> {
        return null;
    }
}
