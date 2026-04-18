const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102';

export interface GrowthPartner {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileData: {
        type: 'Influencer' | 'Agency' | 'Freelancer';
        platforms: string[];
        followers?: string;
        startingPrice?: number;
        rating?: number;
        bio?: string;
        portfolio?: { title: string; url: string }[];
        reviews?: { author: string; comment: string; rating: number }[];
    };
}

export const growthPartnerService = {
    async findAll(token: string, params: { search?: string; platform?: string; type?: string; minBudget?: number; maxBudget?: number; page?: number; limit?: number }) {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.platform) queryParams.append('platform', params.platform);
        if (params.type) queryParams.append('type', params.type);
        if (params.minBudget) queryParams.append('minBudget', params.minBudget.toString());
        if (params.maxBudget) queryParams.append('maxBudget', params.maxBudget.toString());
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await fetch(`${API_URL}/api/growth-partners?${queryParams.toString()}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch growth partners');
        return response.json();
    },

    async getProfile(token: string, id: string) {
        // Since we don't have a specific getOne user endpoint that returns everything for marketplace,
        // and getProfile in backend only returns profileData, we might need a better endpoint
        // But for now, let's assume we fetch by ID if we implement it, 
        // or just use the one from the list if already fetched.
        // Actually, let's add a getOne endpoint in backend or use users service if it works.
        const response = await fetch(`${API_URL}/api/users/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch growth partner profile');
        return response.json();
    }
};
