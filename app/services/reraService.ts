export interface SyncResponse {
    state: string;
    processed: number;
    message?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const reraService = {
    async syncAllStates(token: string): Promise<{ message: string }> {
        const response = await fetch(`${API_URL}/rera/sync`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            throw new Error('Failed to trigger RERA sync for all states');
        }

        return response.json();
    },

    async syncState(state: string, token: string, district?: string): Promise<SyncResponse> {
        const response = await fetch(`${API_URL}/rera/sync/${state.toLowerCase()}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ district }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Failed to sync RERA data for ${state}`);
        }

        return response.json();
    },

    async getProjects(token: string, state?: string, district?: string, search?: string, limit: number = 20): Promise<any[]> {
        let url = `${API_URL}/rera/projects`;
        if (state) {
            url = `${API_URL}/rera/projects/${state.toLowerCase()}`;
        }

        const params = new URLSearchParams();
        if (district) params.append('district', district);
        if (search) params.append('search', search);
        if (limit) params.append('limit', limit.toString());

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch RERA projects');
        }

        return response.json();
    },

    async getDistricts(token: string, state: string): Promise<string[]> {
        const response = await fetch(`${API_URL}/rera/districts/${state.toLowerCase()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return [];
        }

        return response.json();
    },

    async importProject(token: string, projectId: string): Promise<any> {
        const response = await fetch(`${API_URL}/rera/import/${projectId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to import RERA project');
        }

        return response.json();
    },

    async getTotalCount(token: string, state: string, district?: string): Promise<number> {
        const url = `${API_URL}/rera/count/${state.toLowerCase()}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ district }),
        });

        if (!response.ok) {
            return 0;
        }
        const data = await response.json();
        return data.count || 0;
    },
    async getLogs(token: string): Promise<any[]> {
        const url = `${API_URL}/rera/logs`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch RERA logs');
        }

        return response.json();
    }
};
