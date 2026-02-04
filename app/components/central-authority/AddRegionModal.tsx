'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface AddRegionModalProps {
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

export default function AddRegionModal({ isOpen, onClose, onSuccess, initialData }: AddRegionModalProps) {
    const { token } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    // Values for form submission (names)
    const [countryName, setCountryName] = useState('');
    const [stateName, setStateName] = useState('');
    const [cityName, setCityName] = useState('');

    const [selectedContinent, setSelectedContinent] = useState('');
    const [selectedCountryCode, setSelectedCountryCode] = useState('');
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
            setDescription(initialData.description || '');
            setTags(initialData.tags || []);

            // Handle location pre-filling
            const loc = initialData.location || initialData;
            setCountryName(loc.country || '');
            setStateName(loc.state || '');
            setCityName(loc.city || '');

            if (loc.continent) {
                setSelectedContinent(loc.continent);
            }
        }
    }, [isOpen, initialData]);

    // 1. Fetch Continents on load
    useEffect(() => {
        if (isOpen && token && !initialData) {
            fetchContinents();
        }
    }, [isOpen, token, initialData]);

    // 2. Fetch Countries when Continent changes
    useEffect(() => {
        if (isOpen && token) {
            fetchCountries(selectedContinent);
        }
    }, [selectedContinent, isOpen, token]);

    // 3. Fetch States when Country Code changes
    useEffect(() => {
        if (selectedCountryCode && token) {
            fetchStates(selectedCountryCode);
        } else {
            setStates([]);
            setCities([]);
        }
    }, [selectedCountryCode, token]);

    // 4. Fetch Cities when State Code changes
    useEffect(() => {
        if (selectedCountryCode && selectedStateCode && token) {
            fetchCities(selectedCountryCode, selectedStateCode);
        } else {
            setCities([]);
        }
    }, [selectedCountryCode, selectedStateCode, token]);

    const fetchContinents = async () => {
        setLoadingLocations(true);
        try {
            const res = await fetch(`${API_URL}/api/locations/continents`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setContinents(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingLocations(false);
        }
    };

    const fetchCountries = async (continent?: string) => {
        setLoadingLocations(true);
        try {
            const url = continent
                ? `${API_URL}/api/locations/countries?continent=${encodeURIComponent(continent)}`
                : `${API_URL}/api/locations/countries`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setCountries(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingLocations(false);
        }
    };

    const fetchStates = async (cCode: string) => {
        setLoadingLocations(true);
        try {
            const res = await fetch(`${API_URL}/api/locations/states/${cCode}`, {
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
            const res = await fetch(`${API_URL}/api/locations/cities/${cCode}/${sCode}`, {
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

    const handleContinentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cont = e.target.value;
        setSelectedContinent(cont);

        // Reset ALL sub-selections
        setSelectedCountryCode('');
        setCountryName('');
        setSelectedStateId('');
        setSelectedStateCode('');
        setStateName('');
        setCityName('');
        setCountries([]);
        setStates([]);
        setCities([]);
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cCode = e.target.value;
        const cName = countries.find(c => c.code === cCode)?.name || '';
        setSelectedCountryCode(cCode);
        setCountryName(cName);

        // Reset sub-selections
        setSelectedStateId('');
        setSelectedStateCode('');
        setStateName('');
        setCityName('');
        setStates([]);
        setCities([]);
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

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const isEdit = !!initialData?.id;
            const url = isEdit
                ? `${API_URL}/api/regions/${initialData.id}`
                : `${API_URL}/api/regions`;

            const method = isEdit ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    continent: selectedContinent,
                    country: countryName,
                    state: stateName,
                    city: cityName,
                    description,
                    tags
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `Failed to ${isEdit ? 'update' : 'create'} region`);
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
        setName('');
        setDescription('');
        setTags([]);
        setTagInput('');
        setCountryName('');
        setStateName('');
        setCityName('');
        setSelectedContinent('');
        setSelectedCountryCode('');
        setSelectedStateId('');
        setSelectedStateCode('');
        setError(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit Region' : 'Add New Region'}
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
                        {/* Location Dropdowns - Only show on Create */}
                        {!initialData && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Continent
                                    </label>
                                    <select
                                        value={selectedContinent}
                                        onChange={handleContinentChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white"
                                        required
                                    >
                                        <option value="">Select Continent</option>
                                        {continents.map(cont => <option key={cont} value={cont}>{cont}</option>)}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Country
                                        {loadingLocations && !countries.length && <span className="text-xs font-normal text-gray-400 ml-2">(Loading...)</span>}
                                    </label>
                                    <select
                                        value={selectedCountryCode}
                                        onChange={handleCountryChange}
                                        disabled={!selectedContinent}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400"
                                        required
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map(c => <option key={c.id} value={c.code}>{(c as any).emoji} {c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                                    <select
                                        value={selectedStateCode}
                                        onChange={handleStateChange}
                                        disabled={!selectedCountryCode}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400"
                                        required
                                    >
                                        <option value="">Select State</option>
                                        {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                                    <select
                                        value={cityName}
                                        onChange={handleCityChange}
                                        disabled={!selectedStateCode}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400"
                                        required
                                    >
                                        <option value="">Select City</option>
                                        {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        <hr className="border-gray-100" />

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Region Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                                placeholder="e.g. Bandra West"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (Target Areas/Sub-cities)</label>
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tags.map(tag => (
                                        <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100 animate-in zoom-in-95">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                                    placeholder="Type and press Enter to add tags (e.g. Bandra East)"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Detailing / Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400 min-h-[100px] resize-none"
                                placeholder="Add specific details about this region or targeting goals..."
                            />
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
                            ) : (initialData ? 'Update Region' : 'Create Region')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
