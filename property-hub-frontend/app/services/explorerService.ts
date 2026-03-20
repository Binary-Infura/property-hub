import { PropertyUnit } from './unitService';
import { Project } from './propertyService';

// ─── Tower types ─────────────────────────────────────────────────────────────

export interface Tower {
    id: string;
    name: string;
    projectId?: string;
    totalFloors: number | null;
    createdAt: string;
    updatedAt: string;
}

// ─── Slim unit — only what the 3D canvas needs to render ─────────────────────

/**
 * Minimal unit shape returned in the summary.
 * Contains ONLY the fields required to position and colour units in 3D.
 * Price, area, buyer info, etc. are NOT included.
 */
export interface SlimUnit {
    id: string;
    unitNumber: string;
    floor: number | null;
    status: 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'SOLD';
    towerId: string | null;
}

// ─── Summary types ────────────────────────────────────────────────────────────

export interface TowerSummary {
    id: string;
    name: string;
    totalFloors: number | null;
    createdAt: string;
    updatedAt: string;
    unitCounts: {
        total: number;
        AVAILABLE: number;
        RESERVED: number;
        BOOKED: number;
        SOLD: number;
    };
    /** Slim unit list — just enough to render the 3D boxes */
    units: SlimUnit[];
}

/** Lightweight response from the /summary endpoint */
export interface ProjectSummary {
    project: {
        id: string;
        name: string;
        location: string;
        projectType: string;
        status: string;
        price: string | number;
        area: string | number | null;
        bedrooms: number | null;
        bathrooms: number | null;
    };
    towers: TowerSummary[];
    stats: {
        totalUnits: number;
        availableUnits: number;
        reservedUnits: number;
        bookedUnits: number;
        soldUnits: number;
    };
}

// ─── Full unit detail (returned on click) ────────────────────────────────────

/** Full unit returned from /unit/:unitId when the user clicks a unit */
export interface UnitDetail extends PropertyUnit {
    tower?: {
        id: string;
        name: string;
        totalFloors: number | null;
    } | null;
}

// ─── Legacy types (kept for backward compat) ─────────────────────────────────

export interface SpatialData {
    project: Project;
    towers: Tower[];
    units: PropertyUnit[];
    stats: {
        totalUnits: number;
        availableUnits: number;
        soldUnits: number;
        bookedUnits: number;
        reservedUnits: number;
    };
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function normaliseUnit(u: any): PropertyUnit {
    return {
        ...u,
        price:     Number(u.price),
        area:      u.area      != null ? Number(u.area)      : null,
        salePrice: u.salePrice != null ? Number(u.salePrice) : null,
    };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const explorerService = {
    /**
     * ✅ PRIMARY — Lightweight initial load.
     * Returns project + towers + SLIM unit arrays (id/unitNumber/floor/status/towerId).
     * No prices, areas, or buyer data in these arrays.
     */
    async getProjectSummary(projectId: string): Promise<ProjectSummary> {
        const response = await fetch(
            `${API_BASE}/api/spatial-explorer/project/${projectId}/summary`,
        );
        if (!response.ok) {
            throw new Error(`Failed to fetch project summary for ${projectId}`);
        }
        return response.json();
    },

    /**
     * ✅ ON-DEMAND — Full unit details, fetched when the user clicks a unit.
     * Returns everything: price, area, type, buyer info, tower, etc.
     */
    async getUnitDetail(projectId: string, unitId: string): Promise<UnitDetail> {
        const response = await fetch(
            `${API_BASE}/api/spatial-explorer/project/${projectId}/unit/${unitId}`,
        );
        if (!response.ok) {
            throw new Error(`Failed to fetch unit detail for ${unitId}`);
        }
        const data = await response.json();
        return {
            ...normaliseUnit(data),
            tower: data.tower ?? null,
        };
    },

    /**
     * Legacy: full project spatial data (no longer called on initial page load).
     */
    async getSpatialData(projectId: string): Promise<SpatialData> {
        const response = await fetch(
            `${API_BASE}/api/spatial-explorer/project/${projectId}`,
        );
        if (!response.ok) {
            throw new Error(`Failed to fetch spatial data for project ${projectId}`);
        }
        const data = await response.json();
        if (data.units) {
            data.units = data.units.map(normaliseUnit);
        }
        return data;
    },

    /**
     * Legacy: all units unpaginated.
     */
    async getExplorerUnits(projectId: string): Promise<PropertyUnit[]> {
        const response = await fetch(
            `${API_BASE}/api/spatial-explorer/project/${projectId}/units`,
        );
        if (!response.ok) {
            throw new Error(`Failed to fetch explorer units for project ${projectId}`);
        }
        const units = await response.json();
        return units.map(normaliseUnit);
    },
};
