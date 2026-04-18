export type ProjectStatus = 'DRAFT' | 'UNDER_CONSTRUCTION' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
export type ProjectType = 'APARTMENT' | 'VILLA' | 'PLOT' | 'COMMERCIAL' | 'INDUSTRIAL';

export interface Project {
    id: string;
    name: string;
    description?: string;
    location: string;
    address?: string;
    cityName?: string;
    state?: string;
    pincode?: string;
    addressRecord?: {
      line1?: string;
      line2?: string;
      pincode?: string;
      latitude?: number;
      longitude?: number;
      city?: {
        name: string;
        state: string;
      };
    };
    cityGeoId?: number;
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
    projectType: ProjectType; propertyType?: ProjectType;
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
    amenities?: string[];
    highlights?: string[];
    images?: string[];

    brochure?: string;
    specification?: string;
    createdAt: string;
}

export const projectService = {
    async getAll(
        token: string | null,
        myOnly: boolean = false,
        city?: string,
        status?: ProjectStatus,
        page: number = 1,
        limit: number = 10,
        search?: string
    ): Promise<{ data: Project[], total: number }> {
        const params = new URLSearchParams();
        if (city) params.append('city', city);
        if (status) params.append('status', status);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (search) params.append('search', search);

        const query = params.toString() ? `?${params.toString()}` : '';
        const endpoint = myOnly ? '/api/projects/my' : '/api/projects';

        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102'}${endpoint}${query}`, {
            headers,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'No error details' }));
            throw new Error(errorData.message || `Failed to fetch projects (${response.status})`);
        }
        return response.json();
    },

    async getOne(id: string, token: string | null): Promise<Project> {
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102'}/api/projects/${id}`, {
            headers,
        });
        if (!response.ok) {
            throw new Error('Failed to fetch project details');
        }
        return response.json();
    },

    async create(data: Partial<Project>, token: string): Promise<Project> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102'}/api/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create project');
        }
        return response.json();
    },

    async update(id: string, data: Partial<Project>, token: string): Promise<Project> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102'}/api/projects/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update project');
        }
        return response.json();
    },

    async delete(id: string, token: string): Promise<void> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102'}/api/projects/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete project');
        }
    },

    async assignConsultants(id: string, consultantIds: string[], token: string): Promise<Project> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102'}/api/projects/${id}/assign-consultants`, {
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

    async bulkAssignConsultants(projectIds: string[], consultantIds: string[], token: string): Promise<any> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102'}/api/projects/bulk-assign-consultants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ projectIds, consultantIds }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Bulk assignment failed' }));
            throw new Error(error.message || 'Failed bulk assignment');
        }
        return response.json();
    },

    async getStates(): Promise<{ code: string; name: string }[]> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102'}/api/cities/india/states`);
        if (!response.ok) {
            throw new Error('Failed to fetch states');
        }
        return response.json();
    },

    async getCitiesOfState(stateCode: string): Promise<{ id: string; name: string; state: string }[]> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102'}/api/cities?state=${stateCode}`);
        if (!response.ok) {
            throw new Error('Failed to fetch cities of state');
        }
        return response.json();
    }
};

export type PropertyStatus = ProjectStatus;
export type PropertyType = ProjectType;
export type Property = Project;
export const propertyService = projectService;
