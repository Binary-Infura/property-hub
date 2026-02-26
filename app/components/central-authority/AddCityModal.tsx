'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface AddCityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any; // Add this for Edit mode
}

interface Country {
    id: string;
    code: string;
    name: string;
}

interface State {
    id: string;
    name: string;
    code?: string;
}

interface City {
    id: string;
    name: string;
}

export default function AddCityModal({ isOpen, onClose, onSuccess, initialData }: AddCityModalProps) {
    const { token } = useAuth();
    const [name, setName] = useState('');
    const [stateName, setStateName] = useState('');
    const [cityName, setCityName] = useState('');
    const [selectedStateCode, setSelectedStateCode] = useState('');
    const [selectedStateId, setSelectedStateId] = useState('');

    // Data lists
    const [continents, setContinents] = useState<string[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);

    const [loading, setLoading] = useState(false);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // 0. Pre-fill data if in Edit mode
    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name || '');

            // Handle location pre-filling
            const loc = initialData.location || initialData;
            setStateName(loc.state || '');
            setCityName(loc.city || '');
        }
    }, [isOpen, initialData]);

    // Removed search-related functions



    useEffect(() => {
        if (token) {
            fetchStates('IN');
        }
    }, [token]);

    useEffect(() => {
        if (selectedStateCode && token) {
            fetchCities('IN', selectedStateCode);
        }
    }, [selectedStateCode, token]);

    const fetchStates = async (cCode: string) => {
        setLoadingLocations(true);
        try {
            const res = await fetch(`${API_URL}/api/cities/india/states`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setStates(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingLocations(false);
        }
    };

    const fetchCities = async (cCode: string, sCode: string) => {
        setLoadingLocations(true);
        try {
            const res = await fetch(`${API_URL}/api/cities/india/${sCode}/cities`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setCities(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingLocations(false);
        }
    };



    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sId = e.target.value;
        const stateObj = states.find(s => s.id === sId);
        const sName = stateObj?.name || '';
        const sCode = stateObj?.code || '';

        setSelectedStateId(sId);
        setSelectedStateCode(sCode);
        setStateName(sName);

        // Reset sub-selections
        setCityName('');
        setCities([]);
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cName = e.target.value;
        setCityName(cName);
        if (cName) setName(cName);
    };

    const handleNameChange = (val: string) => {
        setName(val);
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const isEdit = !!initialData?.id;
            const url = isEdit
                ? `${API_URL}/api/cities/${initialData.id}`
                : `${API_URL}/api/cities`;

            const method = isEdit ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: cityName,
                    state: stateName,
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `Failed to ${isEdit ? 'update' : 'create'} city`);
            }

            onSuccess();
            handleClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        setStateName('');
        setCityName('');
        setError(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit City' : 'Add New City'}
                    </h2>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* State Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                            <select
                                value={selectedStateCode}
                                onChange={(e) => {
                                    const sCode = e.target.value;
                                    setSelectedStateCode(sCode);
                                    setStateName(states.find(s => s.code === sCode)?.name || '');
                                }}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none bg-white"
                                required
                            >
                                <option value="">Select State</option>
                                {states.map((state) => (
                                    <option key={state.id || state.code} value={state.code}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* City Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                            <select
                                value={cityName}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    setCityName(name);
                                }}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none bg-white"
                                required
                                disabled={!selectedStateCode}
                            >
                                <option value="">Select City</option>
                                {cities.map((city) => (
                                    <option key={city.name} value={city.name}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                        </div>



                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200 text-sm flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (initialData ? 'Update City' : 'Create City')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
