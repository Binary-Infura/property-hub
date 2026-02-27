export type PropertyStatus = 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'UNDER_CONSTRUCTION' | 'APPROVED';
export type PropertyType = 'APARTMENT' | 'VILLA' | 'PLOT' | 'COMMERCIAL' | 'INDUSTRIAL';

export interface Property {
    id: string;
    name: string;
    description?: string;
    location: string;
    address?: string;
    cityId?: string;
    city?: {
        id: string;
        name: string;
        state: string;
    };
    status: PropertyStatus;
    price: number;
    area?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyType: PropertyType;
    onboardedById?: string;
    onboardedBy?: {
        name?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        role?: string;
    };
    assignedTo?: {
        id: string;
        firstName: string;
        lastName?: string;
        email?: string;
    }[];
    createdAt: string;
}

export const propertyService = {
    async getAll(token: string | null, myOnly: boolean = false, city?: string): Promise<Property[]> {
        const params = new URLSearchParams();
        if (myOnly) params.append('myOnly', 'true');
        if (city) params.append('city', city);
        const query = params.toString() ? `?${params.toString()}` : '';

        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/properties${query}`, {
            headers,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'No error details' }));
            throw new Error(errorData.message || `Failed to fetch properties (${response.status})`);
        }
        return response.json();
    },

    async getOne(id: string, token: string | null): Promise<Property> {
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/properties/${id}`, {
            headers,
        });
        if (!response.ok) {
            throw new Error('Failed to fetch property details');
        }
        return response.json();
    },

    async create(data: Partial<Property>, token: string): Promise<Property> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/properties`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create property');
        }
        return response.json();
    },

    async update(id: string, data: Partial<Property>, token: string): Promise<Property> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/properties/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update property');
        }
        return response.json();
    },

    async delete(id: string, token: string): Promise<void> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/properties/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete property');
        }
    },

    async assignConsultants(id: string, consultantIds: string[], token: string): Promise<Property> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/properties/${id}/assign-consultants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ consultantIds }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Assignment failed' }));
            throw new Error(error.message || 'Failed to assign consultants');
        }
        return response.json();
    },

    async bulkAssignConsultants(propertyIds: string[], consultantIds: string[], token: string): Promise<any> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/properties/bulk-assign-consultants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ propertyIds, consultantIds }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Bulk assignment failed' }));
            throw new Error(error.message || 'Failed bulk assignment');
        }
        return response.json();
    }
};
