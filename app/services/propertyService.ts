export type PropertyStatus = 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'UNDER_CONSTRUCTION';
export type PropertyType = 'APARTMENT' | 'VILLA' | 'PLOT' | 'COMMERCIAL' | 'INDUSTRIAL';

export interface Property {
    id: string;
    name: string;
    description?: string;
    location: string;
    address?: string;
    regionId: string;
    status: PropertyStatus;
    price: number;
    area?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyType: PropertyType;
    onboardedById?: string;
    onboardedBy?: {
        name: string;
        role: string;
    };
    region?: {
        name: string;
        code: string;
    };
    createdAt: string;
}

export const propertyService = {
    async getAll(token: string, regionSlug: string, myOnly: boolean = false): Promise<Property[]> {
        const query = myOnly ? '?myOnly=true' : '';
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/${regionSlug}/properties${query}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch properties');
        }
        return response.json();
    },

    async create(data: Partial<Property>, token: string, regionSlug: string): Promise<Property> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/${regionSlug}/properties`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create property');
        }
        return response.json();
    }
};
