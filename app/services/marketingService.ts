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
    },

    async createLead(token: string, data: any) {
        const response = await fetch(`${API_URL}/api/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create lead');
        return response.json();
    },

    async submitPublicInquiry(data: any) {
        const response = await fetch(`${API_URL}/api/leads/public/inquire`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to submit inquiry');
        return response.json();
    },

    async bulkUploadLeads(token: string, leads: any[]) {
        const response = await fetch(`${API_URL}/api/leads/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ leads })
        });
        if (!response.ok) throw new Error('Failed to bulk upload leads');
        return response.json();
    },

    async getProperties(token: string) {
        const response = await fetch(`${API_URL}/api/projects`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch properties');
        return response.json();
    },

    async getUsers(token: string) {
        const response = await fetch(`${API_URL}/api/users`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    }
};
