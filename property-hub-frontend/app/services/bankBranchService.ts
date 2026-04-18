export interface BankBranch {
    id: string;
    bankId: string;
    organizationId: string;
    cityId: string;
    name: string;
    address?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    bank?: { name: string };
    city?: { name: string };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102';

export const bankBranchService = {
    async getBranches(bankId?: string, cityId?: string): Promise<BankBranch[]> {
        const params = new URLSearchParams();
        if (bankId) params.append('bankId', bankId);
        if (cityId) params.append('cityId', cityId);
        
        const response = await fetch(`${API_URL}/api/bank-branches?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch bank branches');
        return response.json();
    },

    async createBranch(token: string, data: any): Promise<BankBranch> {
        const response = await fetch(`${API_URL}/api/bank-branches`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to create branch');
        }
        return response.json();
    }
};
