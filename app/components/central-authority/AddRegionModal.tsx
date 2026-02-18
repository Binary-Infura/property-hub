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
    const [countryName, setCountryName] = useState('India');
    const [stateName, setStateName] = useState('');
    const [cityName, setCityName] = useState('');

    const [selectedContinent, setSelectedContinent] = useState('Asia');
    const [selectedCountryCode, setSelectedCountryCode] = useState('IN');
    const [selectedStateCode, setSelectedStateCode] = useState('');
    const [selectedStateId, setSelectedStateId] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [isFetchingPostalCode, setIsFetchingPostalCode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedPostalCodes, setSelectedPostalCodes] = useState<any[]>([]);

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
            if (initialData.postalCode) {
                setPostalCode(initialData.postalCode);
            }
        }
    }, [isOpen, initialData]);

    const fetchPostalCodeDetails = async (code: string) => {
        if (!code || code.length < 3) return;
        setIsFetchingPostalCode(true);
        try {
            const res = await fetch(`${API_URL}/api/postal-codes/${code}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setSelectedContinent('Asia');
                    setCountryName('India');
                    setStateName(data.state || data.stateName || '');
                    setCityName(data.city || data.officeName || data.district || '');
                    if (!name) setName(data.city || data.officeName || data.district || '');
                }
            }
        } catch (e) {
            console.error('Failed to fetch postal code details', e);
        } finally {
            setIsFetchingPostalCode(false);
        }
    };

    const searchLocations = async (query: string) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(`${API_URL}/api/postal-codes?search=${encodeURIComponent(query)}&limit=10`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.items || []);
                setShowResults(true);
            }
        } catch (e) {
            console.error('Failed to search locations', e);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectLocation = (loc: any) => {
        // Set primary location details for region creation
        setPostalCode(loc.code || '');
        setSelectedContinent('Asia');
        setCountryName('India');
        setStateName(loc.state || loc.stateName || '');
        setCityName(loc.city || loc.officeName || loc.district || '');
        if (!name) setName(loc.city || loc.officeName || loc.district || '');
        setSearchQuery('');
        setShowResults(false);

        // Add to selected postal codes if not already there
        if (!selectedPostalCodes.find(pc => pc.code === loc.code)) {
            setSelectedPostalCodes([...selectedPostalCodes, loc]);
        }
    };

    const removePostalCode = (code: string) => {
        setSelectedPostalCodes(selectedPostalCodes.filter(pc => pc.code !== code));
    };

    // 1. Fetch Continents on load
    useEffect(() => {
        if (isOpen && token && !initialData) {
            // fetchContinents(); // Removed
        }
    }, [isOpen, token, initialData]);

    // 2. Fetch Countries when Continent changes
    useEffect(() => {
        if (isOpen && token) {
            // fetchCountries(selectedContinent); // Removed
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

    const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPostalCode(val);
        if (val.length >= 6) {
            fetchPostalCodeDetails(val);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        searchLocations(val);
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
                    postalCode,
                    postalCodes: selectedPostalCodes.map(pc => pc.code),
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
        setCountryName('India');
        setStateName('');
        setCityName('');
        setSelectedContinent('Asia');
        setPostalCode('');
        setSearchQuery('');
        setSearchResults([]);
        setSelectedPostalCodes([]);
        setSelectedCountryCode('IN');
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
                        {/* flexible Search - NEW */}
                        {!initialData && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Search Location (City, Postal Code, or Area)
                                        {isSearching && <span className="text-xs font-normal text-gray-400 ml-2 animate-pulse">(Searching...)</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                                        placeholder="Enter City, Postal Code, or District..."
                                        required
                                    />

                                    {showResults && searchResults.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                                            {searchResults.map((loc) => (
                                                <button
                                                    key={loc.id}
                                                    type="button"
                                                    onClick={() => handleSelectLocation(loc)}
                                                    className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 flex flex-col"
                                                >
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {loc.officeName || loc.district}, {loc.stateName}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Postal Code: {loc.code} • {loc.district}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {showResults && searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-sm text-gray-500">
                                            No locations found.
                                        </div>
                                    )}
                                </div>

                                {cityName && (
                                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm space-y-2 animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">Region Location Identified</div>
                                                <div className="text-base font-bold text-gray-900 leading-tight">
                                                    {cityName}
                                                </div>
                                                <div className="text-xs text-gray-600 font-medium">
                                                    {stateName}, {countryName}
                                                </div>
                                            </div>
                                            {postalCode && (
                                                <div className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-indigo-600 border border-indigo-100 uppercase tracking-tighter">
                                                    {postalCode}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-gray-400 italic">
                                            This region will be created within {cityName}.
                                        </div>
                                    </div>
                                )}

                                {selectedPostalCodes.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Postal Codes Covered ({selectedPostalCodes.length})
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPostalCodes.map(pc => (
                                                <span key={pc.code} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg border border-indigo-200 animate-in zoom-in-95">
                                                    <span className="font-bold">{pc.code}</span>
                                                    <span className="text-indigo-400">•</span>
                                                    <span>{pc.officeName || pc.district}</span>
                                                    <button type="button" onClick={() => removePostalCode(pc.code)} className="ml-1 hover:text-indigo-900">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {!initialData && !cityName && !isSearching && (
                            <div className="p-6 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Ready to search</p>
                                <p className="text-xs text-gray-400 mt-1">Start typing a city or area name above</p>
                            </div>
                        )}

                        {initialData && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-gray-400">City</label>
                                    <div className="px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-500 italic">
                                        {cityName}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-gray-400">State</label>
                                    <div className="px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-500 italic">
                                        {stateName}
                                    </div>
                                </div>
                            </div>
                        )}

                        <hr className="border-gray-50" />

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
