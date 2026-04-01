'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { RoleId } from '@/app/contexts/UnifiedAppContext';
import { getStatesOfCountry, getCitiesOfState } from '@countrystatecity/countries';

interface AssignRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialRole?: RoleId;
    fixedRole?: boolean;
    isCityContext?: boolean;
}

interface User {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
    role: string;
}

interface City {
    id: string;
    geoId: number;
    name: string;
    code: string;
    city?: string;
}

export default function AssignRoleModal({ isOpen, onClose, onSuccess, initialRole, fixedRole, isCityContext }: AssignRoleModalProps) {
    const { token } = useAuth();
    const [role, setRole] = useState<RoleId>(initialRole || 'GROWTH_PARTNER');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedCityIds, setSelectedCityIds] = useState<number[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [cities, setCitiesList] = useState<City[]>([]);
    const [userSearch, setUserSearch] = useState('');

    const [stateFilter, setStateFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');

    const [availableStates, setAvailableStates] = useState<{ id: string; name: string; code: string }[]>([]);
    const [availableCities, setAvailableCities] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const ALL_ROLES: RoleId[] = [
        'GROWTH_PARTNER',

    ];

    const ASSIGNABLE_ROLES = isCityContext
        ? ['GROWTH_PARTNER' as RoleId]
        : ALL_ROLES.filter(r => r !== 'GROWTH_PARTNER');

    useEffect(() => {
        if (isOpen && initialRole) {
            setRole(initialRole);
        }
    }, [isOpen, initialRole]);

    useEffect(() => {
        if (isOpen) {
            fetchCitiesList();
            // Default to India
            fetchStates('IN');
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            fetchCitiesList();
        }
    }, [isOpen, stateFilter, cityFilter]);

    useEffect(() => {
        if (isOpen && stateFilter) {
            // Assume India (IN)
            // Need to find state code from avaialbleStates
            const stateObj = availableStates.find(s => s.code === stateFilter || s.id === stateFilter || s.name === stateFilter);
            if (stateObj) fetchCities('IN', stateObj.code);
        } else {
            setAvailableCities([]);
        }
    }, [isOpen, stateFilter]);

    useEffect(() => {
        if (role && userSearch.length >= 2) {
            searchUsers();
        } else {
            setUsers([]);
        }
    }, [role, userSearch]);

    const fetchCitiesList = async () => {
        if (!token) return;
        try {
            const params = new URLSearchParams();
            params.append('limit', '1000');
            params.append('country', 'India');
            if (stateFilter) {
                const state = availableStates.find(s => s.code === stateFilter || s.id === stateFilter || s.name === stateFilter);
                if (state) params.append('state', state.name);
            }
            if (cityFilter) params.append('city', cityFilter);

            const response = await fetch(`${API_URL}/api/cities?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setCitiesList(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch cities:', err);
        }
    };



    const fetchStates = async (cCode: string) => {
        try {
            const statesData = await getStatesOfCountry(cCode);
            const formatted = statesData.map((state: any) => ({
                id: state.iso2,
                name: state.name,
                code: state.iso2,
            }));
            setAvailableStates(formatted);
        } catch (e) { 
            console.error('Error fetching states:', e); 
            setAvailableStates([]);
        }
    };

    const fetchCities = async (cCode: string, sCode: string) => {
        try {
            const citiesData = await getCitiesOfState(cCode, sCode);
            const formatted = citiesData.map((city: any) => ({
                id: city.id,
                name: city.name,
            }));
            setAvailableCities(formatted);
        } catch (e) { 
            console.error('Error fetching cities:', e); 
            setAvailableCities([]);
        }
    };

    const searchUsers = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch(
                `${API_URL}/api/cities/allocations/users/search?query=${userSearch}&role=${role}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (err) {
            console.error('Failed to search users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCityToggle = (cityGeoId: number) => {
        setSelectedCityIds((prev) =>
            prev.includes(cityGeoId)
                ? prev.filter((id) => id !== cityGeoId)
                : [...prev, cityGeoId]
        );
    };

    const handleSubmit = async () => {
        if (!selectedUserId || selectedCityIds.length === 0 || !token) {
            alert('Please select a user and at least one city');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/cities/allocations/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: selectedUserId,
                    cityGeoIds: selectedCityIds,
                }),
            });

            if (response.ok) {
                resetForm();
                onSuccess();
                onClose();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to assign cities');
            }
        } catch (err) {
            console.error('Failed to assign cities:', err);
            alert('An error occurred while assigning cities');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setRole(initialRole || 'GROWTH_PARTNER');
        setSelectedUserId('');
        setSelectedCityIds([]);
        setUserSearch('');
        setUsers([]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{isCityContext ? 'Assign Manager to Cities' : 'Assign Manager to Cities'}</h2>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Assignment Orchestrator</p>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto flex-1">
                    {/* Role Selection */}
                    {!fixedRole && (
                        <div className="space-y-3">
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">1. Select Strategic Role</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                {ASSIGNABLE_ROLES.map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setRole(r)}
                                        className={`px-3 py-2 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all h-12 flex items-center justify-center text-center ${role === r
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {r.replace(/-/g, ' ').replace('property ', '')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* User Search */}
                    <div className="space-y-4">
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">2. Identify Manager</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or verified email..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {loading && (
                            <div className="flex items-center justify-center py-4">
                                <div className="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            </div>
                        )}

                        {users.length > 0 && (
                            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-gray-50/30">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => setSelectedUserId(user.id)}
                                        className={`p-4 cursor-pointer transition-all border-b border-gray-100 last:border-b-0 group ${selectedUserId === user.id ? 'bg-blue-50/50' : 'hover:bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className={`text-sm font-bold transition-colors ${selectedUserId === user.id ? 'text-blue-600' : 'text-gray-900'}`}>{user.firstName} {user.lastName}</p>
                                                <p className="text-[11px] font-medium text-gray-400 uppercase mt-0.5">{user.email}</p>
                                            </div>
                                            {selectedUserId === user.id && (
                                                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-200">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {userSearch.length >= 2 && users.length === 0 && !loading && (
                            <p className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest py-2 italic">No compatible managers found</p>
                        )}
                    </div>

                    {/* City Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">3. Scope Selection ({selectedCityIds.length} Cities)</label>
                            <div className="flex flex-wrap gap-2 justify-end max-w-[60%]">

                                <select
                                    value={stateFilter}
                                    onChange={(e) => { setStateFilter(e.target.value); setCityFilter(''); }}
                                    className="px-2 py-1 text-[9px] font-black uppercase border rounded bg-white outline-none focus:ring-1 focus:ring-blue-500 max-w-[100px] overflow-hidden truncate"
                                >
                                    <option value="">All States</option>
                                    {availableStates.map(s => <option key={s.id} value={s.code}>{s.name}</option>)}
                                </select>
                                <select
                                    value={cityFilter}
                                    onChange={(e) => setCityFilter(e.target.value)}
                                    className="px-2 py-1 text-[9px] font-black uppercase border rounded bg-white outline-none focus:ring-1 focus:ring-blue-500 max-w-[100px] overflow-hidden truncate"
                                >
                                    <option value="">All Cities</option>
                                    {availableCities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                            {cities.map((city) => (
                                <div
                                    key={city.id}
                                    onClick={() => handleCityToggle(city.geoId)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer group flex items-start gap-3 ${selectedCityIds.includes(city.geoId)
                                        ? 'bg-blue-50/50 border-blue-500/20 shadow-sm'
                                        : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                                        }`}
                                >
                                    <div className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 transition-all flex items-center justify-center ${selectedCityIds.includes(city.geoId)
                                        ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-200'
                                        : 'bg-gray-50 border-gray-200 group-hover:border-gray-300'
                                        }`}>
                                        {selectedCityIds.includes(city.geoId) && (
                                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-bold transition-colors ${selectedCityIds.includes(city.geoId) ? 'text-blue-600' : 'text-gray-900'}`}>{isCityContext ? (city.city || city.name) : city.name}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mt-1">{city.code}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/30">
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !selectedUserId || selectedCityIds.length === 0}
                        className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 transform active:scale-95"
                    >
                        {submitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                Finalizing...
                            </div>
                        ) : 'Confirm Allocation'}
                    </button>
                </div>
            </div>
        </div>
    );
}
