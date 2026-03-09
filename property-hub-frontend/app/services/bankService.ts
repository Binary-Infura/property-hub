export interface Bank {
    id: string;
    name: string;
    percentage: number;
    logoUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const bankService = {
    async getAllBanks(token: string): Promise<Bank[]> {
        const response = await fetch(`${API_URL}/api/banks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch banks');
        return response.json();
    },

    async getActiveBanks(): Promise<Bank[]> {
        const response = await fetch(`${API_URL}/api/banks/active`);
        if (!response.ok) throw new Error('Failed to fetch active banks');
        return response.json();
    },

    async createBank(token: string, data: Partial<Bank>): Promise<Bank> {
        const response = await fetch(`${API_URL}/api/banks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create bank');
        return response.json();
    },

    async updateBank(token: string, id: string, data: Partial<Bank>): Promise<Bank> {
        const response = await fetch(`${API_URL}/api/banks/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update bank');
        return response.json();
    },

    async deleteBank(token: string, id: string): Promise<void> {
        const response = await fetch(`${API_URL}/api/banks/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete bank');
    }
};
