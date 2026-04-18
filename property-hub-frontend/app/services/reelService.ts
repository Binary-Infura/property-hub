const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102';

export interface Reel {
    id: string;
    title?: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    userId: string;
    projectId: string;
    publishToOfficialInstagram?: boolean;
    publishToPartnerInstagram?: boolean;
    instagramStatus?: string;
    instagramCaption?: string;
    instagramPostUrl?: string;
    user: {
        id: string;
        firstName: string;
        lastName?: string;
    };
    project?: {
        id: string;
        name: string;
    };
    createdAt: string;
}

export interface ReelsResponse {
    data: Reel[];
    total: number;
    hasMore: boolean;
}

export const reelService = {
    async getAll(page = 1, limit = 8, projectId?: string): Promise<ReelsResponse> {
        let url = `${API_URL}/api/reels?page=${page}&limit=${limit}`;
        if (projectId && projectId !== 'All') {
            url += `&projectId=${projectId}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch reels' }));
            throw new Error(error.message || 'Failed to fetch reels');
        }
        return response.json();
    },

    async getMy(token: string): Promise<Reel[]> {
        const response = await fetch(`${API_URL}/api/reels/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch my reels' }));
            throw new Error(error.message || 'Failed to fetch my reels');
        }
        return response.json();
    },

    async create(reelData: Partial<Reel>, token: string): Promise<Reel> {
        const response = await fetch(`${API_URL}/api/reels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reelData)
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to create reel' }));
            throw new Error(error.message || 'Failed to create reel');
        }
        return response.json();
    },

    async delete(id: string, token: string): Promise<void> {
        const response = await fetch(`${API_URL}/api/reels/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to delete reel' }));
            throw new Error(error.message || 'Failed to delete reel');
        }
    },

    async uploadVideo(file: File, token: string): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_URL}/api/uploads`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to upload video' }));
            throw new Error(error.message || 'Failed to upload video');
        }
        return response.json();
    },

    async updateInstagramSettings(id: string, settings: Partial<Reel>, token: string): Promise<Reel> {
        const response = await fetch(`${API_URL}/api/reels/${id}/instagram`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(settings)
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to update reel' }));
            throw new Error(error.message || 'Failed to update reel');
        }
        return response.json();
    },

    async getPendingForModeration(page = 1, limit = 10, token: string): Promise<ReelsResponse> {
        const response = await fetch(`${API_URL}/api/reels/moderation/pending?page=${page}&limit=${limit}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch pending reels' }));
            throw new Error(error.message || 'Failed to fetch pending reels');
        }
        return response.json();
    },

    async getReelForModeration(id: string, token: string): Promise<Reel> {
        const response = await fetch(`${API_URL}/api/reels/${id}/moderation`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch reel' }));
            throw new Error(error.message || 'Failed to fetch reel');
        }
        return response.json();
    }
};
