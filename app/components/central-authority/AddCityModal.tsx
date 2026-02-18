'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface AddCityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface State {
    id: string;
    name: string;
    code: string;
}

interface City {
    id: string;
    name: string;
}

export default function AddCityModal({ isOpen, onClose, onSuccess }: AddCityModalProps) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Location State
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);

    // Selection State
    const [selectedStateCode, setSelectedStateCode] = useState('');
    const [selectedStateName, setSelectedStateName] = useState('');
    const [selectedCityName, setSelectedCityName] = useState('');

    // Hardcoded for India context
    const countryName = 'India';
    const countryCode = 'IN';
    const continent = 'Asia';

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Fetch States on Open
    useEffect(() => {
        if (isOpen && token) {
            fetchStates();
        }
    }, [isOpen, token]);

    // Fetch Cities when State Changes
    useEffect(() => {
        if (selectedStateCode && token) {
            fetchCities(selectedStateCode);
        } else {
            setCities([]);
        }
    }, [selectedStateCode, token]);

    const fetchStates = async () => {
        try {
            const res = await fetch(`${API_URL}/api/locations/states/${countryCode}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setStates(await res.json());
            }
        } catch (e) {
            console.error(e);
            setError('Failed to load states');
        }
    };

    const fetchCities = async (sCode: string) => {
        try {
            const res = await fetch(`${API_URL}/api/locations/cities/${countryCode}/${sCode}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setCities(await res.json());
            }
        } catch (e) {
            console.error(e);
            setError('Failed to load cities');
        }
    };

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sId = e.target.value;
        const state = states.find(s => s.id === sId);
        if (state) {
            setSelectedStateCode(state.code);
            setSelectedStateName(state.name);
            setSelectedCityName('');
        } else {
            setSelectedStateCode('');
            setSelectedStateName('');
            setSelectedCityName('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Check if city is selected
            if (!selectedCityName) {
                throw new Error('Please select a city');
            }

            // Create region with city name
            const response = await fetch(`${API_URL}/api/regions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: selectedCityName, // Region name is the City Name
                    continent: continent,
                    country: countryName,
                    state: selectedStateName,
                    city: selectedCityName,
                    description: `City region for ${selectedCityName}, ${selectedStateName}`,
                    tags: ['City-Level']
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to onboard city');
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
        setSelectedStateCode('');
        setSelectedStateName('');
        setSelectedCityName('');
        setError(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">
                        Onboard New City
                    </h2>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                        <h4 className="text-orange-900 font-bold text-sm mb-1">City Onboarding</h4>
                        <p className="text-orange-700 text-xs">Select a state and city to create a new key operational region.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                            <select
                                value={states.find(s => s.code === selectedStateCode)?.id || ''}
                                onChange={handleStateChange}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                                required
                            >
                                <option value="">Select State</option>
                                {states.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                            <select
                                value={selectedCityName}
                                onChange={(e) => setSelectedCityName(e.target.value)}
                                disabled={!selectedStateCode}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm disabled:bg-gray-50 disabled:text-gray-400"
                                required
                            >
                                <option value="">Select City</option>
                                {cities.map((c) => (
                                    <option key={c.id} value={c.name}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
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
                            className="flex-1 px-4 py-2.5 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-orange-200 text-sm flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Onboarding...
                                </>
                            ) : 'Onboard City'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
