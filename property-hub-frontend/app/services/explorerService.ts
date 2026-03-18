import { PropertyUnit } from './unitService';
import { Project } from './propertyService';

export interface SpatialData {
    project: Project;
    towers: any[];
    units: PropertyUnit[];
    stats: {
        totalUnits: number;
        draftUnits: number;
        soldUnits: number;
        bookedUnits: number;
        reservedUnits: number;
    };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const explorerService = {
    /**
     * Fetch all spatial data for a project in a single request.
     */
    async getSpatialData(projectId: string): Promise<SpatialData> {
        const response = await fetch(`${API_BASE}/api/spatial-explorer/project/${projectId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch spatial data for project ${projectId}`);
        }
        const data = await response.json();
        
        // Normalize decimal fields for units
        if (data.units) {
            data.units = data.units.map((u: any) => ({
                ...u,
                price: Number(u.price),
                area: u.area != null ? Number(u.area) : null,
                salePrice: u.salePrice != null ? Number(u.salePrice) : null,
            }));
        }
        
        return data;
    },

    /**
     * Fetch all units for a project specifically for the explorer.
     * This endpoint is not paginated so it returns all units.
     */
    async getExplorerUnits(projectId: string): Promise<PropertyUnit[]> {
        const response = await fetch(`${API_BASE}/api/spatial-explorer/project/${projectId}/units`);
        if (!response.ok) {
            throw new Error(`Failed to fetch explorer units for project ${projectId}`);
        }
        const units = await response.json();
        
        return units.map((u: any) => ({
            ...u,
            price: Number(u.price),
            area: u.area != null ? Number(u.area) : null,
            salePrice: u.salePrice != null ? Number(u.salePrice) : null,
        }));
    }
};
