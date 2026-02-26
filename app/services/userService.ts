const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
    id: string;
    keycloakId?: string;
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
    };
    serviceProviderProfile?: any;
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

    async create(userData: Partial<User>, token: string): Promise<User> {
        const response = await fetch(`${API_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create user');
        }
        return response.json();
    },

    async update(id: string, userData: Partial<User>, token: string): Promise<User> {
        const response = await fetch(`${API_URL}/api/users/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
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
};
