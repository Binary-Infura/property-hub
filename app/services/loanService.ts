import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const loanService = {
    async submitLoan(token: string, data: any) {
        const response = await axios.post(`${API_URL}/api/loans`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    async applyLoan(token: string, data: any) {
        const response = await axios.post(`${API_URL}/api/loans/apply`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    async getLoans(token: string) {
        const response = await axios.get(`${API_URL}/api/loans`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    async getLoanDetails(token: string, id: string) {
        const response = await axios.get(`${API_URL}/api/loans/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    async updateLoanStatus(token: string, id: string, status: string) {
        const response = await axios.patch(`${API_URL}/api/loans/${id}/status`, { status }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },
};
