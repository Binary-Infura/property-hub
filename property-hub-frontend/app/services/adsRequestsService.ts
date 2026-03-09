const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const adsRequestsService = {
    async getAdsRequests(token: string) {
        const response = await fetch(`${API_URL}/api/ads-requests`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch ads requests');
        return response.json();
    },

    async createAdsRequest(token: string, data: any) {
        const response = await fetch(`${API_URL}/api/ads-requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create ads request');
        return response.json();
    },

    async updateAdsRequest(token: string, id: string, data: any) {
        const response = await fetch(`${API_URL}/api/ads-requests/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update ads request');
        return response.json();
    },

    async deleteAdsRequest(token: string, id: string) {
        const response = await fetch(`${API_URL}/api/ads-requests/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete ads request');
        return response.json();
    }
};
