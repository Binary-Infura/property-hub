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

    getCallLogs: async (token: string) => {
        const response = await axios.get(`${API_URL}/leads/calls/history`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getLeadCallLogs: async (token: string, leadId: string) => {
        const response = await axios.get(`${API_URL}/leads/${leadId}/calls`, {
            headers: { Authorization: `Bearer ${token}` }
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



    makeCall: async (token: string, leadId: string) => {
        const response = await axios.post(`${API_URL}/leads/${leadId}/call`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },

    sendVideoCallLink: async (token: string, leadId: string, channel: 'email' | 'whatsapp') => {
        const response = await axios.post(`${API_URL}/leads/${leadId}/send-video-link`, {
            channel,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },

    getLeadActivities: async (token: string, leadId: string) => {
        const response = await axios.get(`${API_URL}/activity-logs/lead/${leadId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    generateVideoRoom: async (token: string, leadId: string) => {
        const response = await axios.post(`${API_URL}/leads/${leadId}/generate-video-room`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
};
