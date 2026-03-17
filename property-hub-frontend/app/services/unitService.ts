export type UnitStatus = 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'SOLD';

export interface PropertyUnit {
    id: string;
    projectId: string;
    unitNumber: string;
    floor: number | null;
    type: string | null;
    area: number | null;
    price: number;
    status: UnitStatus;
    buyerName?: string | null;
    buyerPhone?: string | null;
    salePrice?: number | null;
    soldAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const unitService = {
    async getByProject(projectId: string): Promise<PropertyUnit[]> {
        const response = await fetch(`${API_BASE}/api/units/project/${projectId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch units for project ${projectId}`);
        }
        const data = await response.json();
        // Normalize Decimal fields (Prisma returns them as strings)
        return data.map((u: any) => ({
            ...u,
            price: Number(u.price),
            area: u.area != null ? Number(u.area) : null,
            salePrice: u.salePrice != null ? Number(u.salePrice) : null,
        }));
    },
};
