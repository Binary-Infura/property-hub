import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface CallLogFilter {
    consultantId?: string;
    projectId?: string;
}

export const callLogService = {
    getCallLogs: async (token: string, filters?: CallLogFilter) => {
        let url = `${API_URL}/leads/calls/history`;
        const params = new URLSearchParams();
        if (filters?.consultantId) params.append('consultantId', filters.consultantId);
        if (filters?.projectId) params.append('projectId', filters.projectId);

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
};
