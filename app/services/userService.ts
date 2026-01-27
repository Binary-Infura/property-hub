const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
    id: string;
    keycloakId?: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    status: 'active' | 'inactive';
    agencyName?: string;
    reraId?: string;
    rating?: number;
    visitsConducted?: number;
    regions?: any[];
    regionIds?: string[];
    createdAt: string;
}

export const userService = {
    async getAllByRole(role: string, token: string, regionSlug?: string, myOnly: boolean = false): Promise<any[]> {
        const params = new URLSearchParams();
        if (regionSlug) params.append('region', regionSlug);
        if (myOnly) params.append('myOnly', 'true');

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
};
