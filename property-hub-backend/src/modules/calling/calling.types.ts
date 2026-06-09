
export interface CallParams {
    from: string;
    to: string;
    leadId: string;
    }

export interface CallResponse {
    success: boolean;
    sid: string;
    provider: string;
}

export interface CallingProvider {
    makeCall(params: CallParams): Promise<CallResponse>;
    getCallDetails(sid: string): Promise<any>;
}

export enum CallProviderType {
    EXOTEL = 'EXOTEL',
    KNOWLARITY = 'KNOWLARITY',
    TWILIO = 'TWILIO'
}
