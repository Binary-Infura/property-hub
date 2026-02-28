'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { cityService } from '@/app/services/cityService';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import { toast } from 'react-hot-toast';

interface Manager {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
}

interface Allocation {
    id: string;
    cityName: string;
    stateCode: string;
    assignedAt: string;
    userId: string;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
        roles: string[];
    };
}

export default function CityAllocationPage() {
    const { token } = useAuth();
    const [states, setStates] = useState<{ id: string, name: string, code: string }[]>([]);
    const [cities, setCities] = useState<{ name: string }[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [allocations, setAllocations] = useState<Allocation[]>([]);

    const [selectedManager, setSelectedManager] = useState<string>('');
    const [selectedState, setSelectedState] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            fetchInitialData();
        }
    }, [token]);

    const fetchInitialData = async () => {
        try {
            const [statesData, allAllocations] = await Promise.all([
                cityService.getStates(token!),
                cityService.getAllAllocations(token!)
            ]);
            setStates(statesData);
            setAllocations(allAllocations);
        } catch (error) {
            console.error('Failed to fetch initial data', error);
        }
    };

    useEffect(() => {
        if (selectedState && token) {
            fetchCities(selectedState);
        } else {
            setCities([]);
        }
    }, [selectedState, token]);

    const fetchCities = async (stateCode: string) => {
        try {
            const citiesData = await cityService.getCities(stateCode, token!);
            setCities(citiesData);
        } catch (error) {
            console.error('Failed to fetch cities', error);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            setLoading(true);
            const results = await cityService.searchManagers(searchQuery, token!);
            setManagers(results);

            // If we found managers, also fetch their allocations if only one found
            if (results.length === 1) {
                const userAllocations = await cityService.getUserAllocations(results[0].id, token!);
                setAllocations(userAllocations);
                setSelectedManager(results[0].id);
            }
        } catch (error) {
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedManager || !selectedState || !selectedCity) {
            toast.error('Please select manager, state and city');
            return;
        }

        try {
            setLoading(true);
            await cityService.assignCity({
                userId: selectedManager,
                stateCode: selectedState,
                cityName: selectedCity
            }, token!);

            toast.success('City assigned successfully');

            // Refresh allocations
            const userAllocations = await cityService.getUserAllocations(selectedManager, token!);
            setAllocations(userAllocations);

            setSelectedCity('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Assignment failed');
        } finally {
            setLoading(false);
        }
    };

    const handleUnassign = async (id: string) => {
        try {
            setLoading(true);
            await cityService.unassignCity(id, token!);
            toast.success('City unassigned');
            setAllocations(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            toast.error('Failed to unassign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">City Allocation</h1>
                    <p className="text-slate-500 font-medium">Assign cities to Marketing and Onboarding Managers</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Search & Selection */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h2 className="text-lg font-bold mb-4">1. Select Manager</h2>
                        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or email..."
                                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition"
                                disabled={loading}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </form>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {managers.map(manager => (
                                <div
                                    key={manager.id}
                                    onClick={() => {
                                        setSelectedManager(manager.id);
                                        // Fetch allocations for this manager
                                        cityService.getUserAllocations(manager.id, token!).then(data => setAllocations(data));
                                    }}
                                    className={`p-3 rounded-xl border cursor-pointer transition ${selectedManager === manager.id ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
                                >
                                    <p className="font-bold text-sm text-slate-900">{manager.firstName} {manager.lastName}</p>
                                    <p className="text-xs text-slate-500 capitalize">{manager.roles?.[0]?.replace('-', ' ')}</p>
                                </div>
                            ))}
                            {managers.length === 0 && !loading && (
                                <p className="text-xs text-slate-400 text-center py-4">Search for a manager to begin</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h2 className="text-lg font-bold mb-4">2. Pick Location</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">State</label>
                                <select
                                    value={selectedState}
                                    onChange={(e) => setSelectedState(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="">Select State</option>
                                    {states.map(state => (
                                        <option key={state.code} value={state.code}>{state.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">City</label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    disabled={!selectedState}
                                >
                                    <option value="">Select City</option>
                                    {cities.map(city => (
                                        <option key={city.name} value={city.name}>{city.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleAssign}
                                disabled={loading || !selectedManager || !selectedCity}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 mt-4 shadow-lg shadow-blue-500/20"
                            >
                                Assign City
                            </button>
                        </div>
                    </div>
                </div>

                {/* Current Allocations */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-slate-900">
                                {selectedManager ? 'Manager Allocations' : 'All Existing Allocations'}
                            </h2>
                            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                                {allocations.length} Active
                            </span>
                        </div>

                        {allocations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-2xl flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                </div>
                                <p className="text-slate-400 font-medium">No allocations found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {allocations.map(allocation => (
                                    <div key={allocation.id} className="group relative bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-black text-slate-900">{allocation.cityName}</p>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{allocation.stateCode}</p>
                                                {allocation.user && (
                                                    <div className="mt-2 pt-2 border-t border-slate-100">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Assigned To</p>
                                                        <p className="text-xs font-medium text-slate-600">{allocation.user.firstName} {allocation.user.lastName}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleUnassign(allocation.id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {allocations.length === 0 && (
                                    <div className="col-span-full py-10 text-center text-slate-400 text-sm italic">
                                        No cities allocated yet.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
