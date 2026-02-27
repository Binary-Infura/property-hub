import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const consultantService = {
    getAssignedProperties: async (token: string) => {
        const response = await axios.get(`${API_URL}/consultants/assigned-properties`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },

    getProfile: async (token: string) => {
        const response = await axios.get(`${API_URL}/consultants/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
};
