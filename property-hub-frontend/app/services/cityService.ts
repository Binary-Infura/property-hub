import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102/api';

export interface City {
    id: string;
    slug: string;
    cityName: string; // The backend uses cityName in allocations
    stateCode: string;
    name?: string; // Standard name
    state?: string; // Standard state
}

export const cityService = {
    getAll: async (token: string) => {
        const response = await axios.get(`${API_BASE_URL}/cities`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    getStates: async (token: string) => {
        const response = await axios.get(`${API_BASE_URL}/cities/india/states`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getCities: async (stateCode: string, token: string) => {
        const response = await axios.get(`${API_BASE_URL}/cities/india/${stateCode}/cities`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    assignCity: async (data: { userId: string; stateCode: string; cityName: string }, token: string) => {
        const response = await axios.post(`${API_BASE_URL}/cities/allocations/assign`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    unassignCity: async (allocationId: string, token: string) => {
        const response = await axios.delete(`${API_BASE_URL}/cities/allocations/${allocationId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getUserAllocations: async (userId: string, token: string) => {
        const response = await axios.get(`${API_BASE_URL}/cities/allocations/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getAllAllocations: async (token: string) => {
        const response = await axios.get(`${API_BASE_URL}/cities/allocations/all`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getMyCities: async (token: string) => {
        const response = await axios.get(`${API_BASE_URL}/cities/allocations/my-cities`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    searchManagers: async (query: string, token: string) => {
        const response = await axios.get(`${API_BASE_URL}/cities/allocations/users/search?q=${query}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
