import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const otpService = {
    async sendOtp(phone?: string, email?: string, checkExists?: boolean): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const response = await axios.post(`${API_URL}/otp/send`, { phone, email, checkExists });
            return { success: true, data: response.data };
        } catch (error: any) {
            console.error('Failed to send OTP:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
            return { success: false, error: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage) };
        }
    },

    async verifyOtp(code: string, phone?: string, email?: string, consume: boolean = true): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const response = await axios.post(`${API_URL}/otp/verify`, { code, phone, email, consume });
            return { success: true, data: response.data };
        } catch (error: any) {
            console.error('Failed to verify OTP:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to verify OTP';
            return { success: false, error: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage) };
        }
    }
};
