const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const marketingService = {
    async getCampaigns(token: string) {
        const response = await fetch(`${API_URL}/api/marketing/campaigns`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch campaigns');
        return response.json();
    },

    async createCampaign(token: string, data: any) {
        const response = await fetch(`${API_URL}/api/marketing/campaigns`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create campaign');
        return response.json();
    },

    async updateCampaign(token: string, id: string, data: any) {
        const response = await fetch(`${API_URL}/api/marketing/campaigns/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update campaign');
        return response.json();
    },

    async deleteCampaign(token: string, id: string) {
        const response = await fetch(`${API_URL}/api/marketing/campaigns/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete campaign');
        return response.json();
    }
};
