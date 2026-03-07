const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
    id: string;
    name?: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    role: string;
    status: 'active' | 'inactive';
    agencyName?: string;
    reraId?: string;
    rating?: number;
    visitsConducted?: number;
    cityAllocations?: any[];
    cityAllocationIds?: string[];
    propertyPartnerProfile?: {
        companyName: string;
        companyAddress?: string;
        taxId?: string;
        licenseNumber?: string;
        isPremium: boolean;
        subscriptionMode: 'PAID' | 'FREE';
    };
    influencerProfile?: {
        socialMediaLinks?: any;
        reach?: number;
        niche?: string;
    };
    brokerProfile?: {
        agencyBusinessName: string;
        reraNumber?: string;
        officeAddress?: string;
    };
    consultantProfile?: {
        specialization: string[];
        experienceYears?: number;
    };
    buyerProfile?: {
        budgetMin?: number;
        budgetMax?: number;
        preferredLocations: string[];
    };
    marketingManagerProfile?: {
        campaignBudgetLimit?: number;
    };
    centralAuthorityProfile?: {
        department?: string;
        accessLevel?: string;
    };
    serviceProviderProfile?: any;
    onboardedBy?: {
        firstName: string;
        lastName: string;
        roles: string[];
    };
    createdAt: string;
}

export const userService = {
    async getAllByRole(role: string, token: string, myOnly: boolean = false, page: number = 1, limit: number = 10): Promise<{ data: User[], total: number }> {
        const params = new URLSearchParams();
        if (myOnly) params.append('myOnly', 'true');
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const queryString = params.toString();
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/role/${role}${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    async create(userData: any, token: string): Promise<User> {
        const payload = { ...userData };
        if (payload.role && !payload.roles) {
            payload.roles = [payload.role];
            delete payload.role;
        }

        const response = await fetch(`${API_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create user');
        }
        return response.json();
    },

    async update(id: string, userData: any, token: string): Promise<User> {
        const payload = { ...userData };
        if (payload.role && !payload.roles) {
            payload.roles = [payload.role];
            delete payload.role;
        }

        const response = await fetch(`${API_URL}/api/users/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to update user');
        return response.json();
    },

    async toggleStatus(id: string, token: string): Promise<User> {
        const response = await fetch(`${API_URL}/api/users/${id}/toggle-status`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to toggle status');
        return response.json();
    },

    async updateProfile(profileData: any, token: string): Promise<User> {
        const response = await fetch(`${API_URL}/api/users/profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update profile');
        }
        return response.json();
    },
    async getById(id: string, token: string | null): Promise<User> {
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_URL}/api/users/${id}`, {
            headers,
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json();
    },

    async follow(id: string, token: string): Promise<any> {
        const response = await fetch(`${API_URL}/api/users/${id}/follow`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Follow API Error:', response.status, errorData);
            throw new Error(errorData.message || 'Failed to follow user');
        }
        return response.json();
    },

    async unfollow(id: string, token: string): Promise<any> {
        const response = await fetch(`${API_URL}/api/users/${id}/unfollow`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to unfollow user');
        return response.json();
    },

    async isFollowing(id: string, token: string): Promise<boolean> {
        const response = await fetch(`${API_URL}/api/users/${id}/is-following`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) return false;
        const data = await response.json();
        return data.isFollowing;
    },

    async getFollowerCount(id: string): Promise<number> {
        const response = await fetch(`${API_URL}/api/users/${id}/follower-count`);
        if (!response.ok) return 0;
        const data = await response.json();
        return data.count;
    },
};
