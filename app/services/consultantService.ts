import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const consultantService = {
    getAssignedProjects: async (token: string) => {
        const response = await axios.get(`${API_URL}/consultants/assigned-projects`, {
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

    updateLeadStatus: async (token: string, leadId: string, status: string) => {
        const response = await axios.patch(`${API_URL}/leads/${leadId}`, {
            status,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
};
