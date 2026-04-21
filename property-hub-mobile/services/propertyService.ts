const API_URL = 'http://localhost:3102';

export const propertyService = {
  async getAll(token: string | null, city?: string, status?: string, page: number = 1, limit: number = 10, search?: string) {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_URL}/api/projects${query}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  }
};
