const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const organizationService = {
    async getOrganizations(token: string, type?: string) {
        const url = new URL(`${API_URL}/api/organizations`);
        if (type) url.searchParams.append('type', type);
        
        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch organizations');
        return response.json();
    },

    async getMembers(token: string, orgId: string, role?: string) {
        const url = new URL(`${API_URL}/api/organizations/${orgId}/members`);
        if (role) url.searchParams.append('role', role);
        
        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch members');
        return response.json();
    }
};
