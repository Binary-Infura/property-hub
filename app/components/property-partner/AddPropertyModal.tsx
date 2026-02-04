'use client';

import { useState, useEffect } from 'react';
import { Property, PropertyStatus } from '@/app/types/property';
import { PROPERTY_TYPES, AMENITIES_OPTIONS, INDIAN_STATES } from '@/app/constants/property';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface StepConfig {
    number: number;
    title: string;
    description: string;
}

const STEPS: StepConfig[] = [
    { number: 1, title: 'Basic Info', description: 'Title, type, and location' },
    { number: 2, title: 'Details', description: 'Area, buildings, and units' },
    { number: 3, title: 'Pricing', description: 'Starting price and amenities' },
    { number: 4, title: 'Documents', description: 'Brochure and specifications' },
];

interface AddPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    editId: string | null;
    onSuccess: () => void;
}

interface Country {
    id: string;
    code: string;
    name: string;
    emoji?: string;
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

export default function AddPropertyModal({ isOpen, onClose, editId, onSuccess }: AddPropertyModalProps) {
    const { token } = useAuth();
    const { activeContext } = useUnifiedApp();
    const regionCode = activeContext.activeRegion.code;

    const [currentStep, setCurrentStep] = useState(1);
    const [propertyId, setPropertyId] = useState<string | null>(editId);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        propertyType: 'residential' as any,
        location: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        totalArea: '',
        totalBuildings: '',
        totalUnits: '',
        startingPrice: '',
        description: '',
        amenities: [] as string[],
    });

    const [files, setFiles] = useState({
        images: [] as File[],
        brochure: null as File | null,
        specification: null as File | null,
    });

    // Location Data States
    const [continents, setContinents] = useState<string[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);

    const [selectedContinent, setSelectedContinent] = useState('Asia'); // Default to Asia
    const [selectedCountryCode, setSelectedCountryCode] = useState('');
    const [selectedStateCode, setSelectedStateCode] = useState('');
    const [loadingLocations, setLoadingLocations] = useState(false);

    // Initial Fetch (Continents & Default Country)
    useEffect(() => {
        if (isOpen && token) {
            fetchContinents();
            // Pre-fetch countries for Asia by default or just all countries
            fetchCountries('Asia');
        }
    }, [isOpen, token]);

    // Fetch States when Country Selected
    useEffect(() => {
        if (selectedCountryCode && token) {
            fetchStates(selectedCountryCode);
        } else {
            setStates([]);
            setCities([]);
        }
    }, [selectedCountryCode, token]);

    // Fetch Cities when State Selected
    useEffect(() => {
        if (selectedCountryCode && selectedStateCode && token) {
            fetchCities(selectedCountryCode, selectedStateCode);
        } else {
            setCities([]);
        }
    }, [selectedCountryCode, selectedStateCode, token]);

    const fetchContinents = async () => {
        try {
            const res = await fetch(`${API_URL}/api/locations/continents`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setContinents(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchCountries = async (continent?: string) => {
        try {
            const url = continent
                ? `${API_URL}/api/locations/countries?continent=${encodeURIComponent(continent)}`
                : `${API_URL}/api/locations/countries`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCountries(data);

                // Auto-select India if available and generic default
                const india = data.find((c: Country) => c.name === 'India');
                if (india && !selectedCountryCode) {
                    setSelectedCountryCode(india.code);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchStates = async (cCode: string) => {
        setLoadingLocations(true);
        try {
            const res = await fetch(`${API_URL}/api/locations/states/${cCode}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setStates(await res.json());
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
            if (res.ok) setCities(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingLocations(false);
        }
    };

    const handleLocationChange = (type: 'continent' | 'country' | 'state' | 'city', value: string) => {
        if (type === 'continent') {
            setSelectedContinent(value);
            fetchCountries(value);
            setSelectedCountryCode('');
            setSelectedStateCode('');
            setStates([]);
            setCities([]);
        } else if (type === 'country') {
            const country = countries.find(c => c.code === value);
            setSelectedCountryCode(value);
            // Reset downstreams
            setSelectedStateCode('');
            setStates([]);
            setCities([]);
            setFormData(prev => ({ ...prev, state: '', city: '' }));
        } else if (type === 'state') {
            const state = states.find(s => s.code === value);
            setSelectedStateCode(value);
            setFormData(prev => ({ ...prev, state: state?.name || '' }));
            // Reset city
            setCities([]);
            setFormData(prev => ({ ...prev, city: '' }));
        } else if (type === 'city') {
            setFormData(prev => ({ ...prev, city: value }));
        }
    };

    // Re-declare handleInputChange locally to avoid shadowing or just use existing

    // Reset or Load existing property
    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(1);
            setPropertyId(null);
            setError(null);
            return;
        }

        if (editId) {
            fetchProperty(editId);
        } else {
            setFormData({
                title: '',
                propertyType: 'residential',
                location: '',
                address: '',
                // Pre-fill from context if available
                city: activeContext.activeRegion.city || '',
                state: activeContext.activeRegion.state || '',
                pincode: '',
                totalArea: '',
                totalBuildings: '',
                totalUnits: '',
                startingPrice: '',
                description: '',
                amenities: [],
            });
            setPropertyId(null);
        }
    }, [editId, isOpen, activeContext.activeRegion]);

    const fetchProperty = async (id: string) => {
        if (!token || !regionCode) return;

        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/${regionCode}/properties/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setPropertyId(data.id);

                let description = data.description || '';
                let amenities: string[] = [];
                if (description.includes('Amenities:')) {
                    const parts = description.split('Amenities:');
                    description = parts[0].trim();
                    amenities = parts[1].split(',').map((a: string) => a.trim());
                }

                setFormData({
                    title: data.name,
                    propertyType: (data.propertyType === 'COMMERCIAL' ? 'commercial' : 'residential') as any,
                    location: data.location,
                    address: data.address || '',
                    city: '',
                    state: '',
                    pincode: '',
                    totalArea: data.area?.toString() || '',
                    totalBuildings: '',
                    totalUnits: '',
                    startingPrice: data.price?.toString() || '',
                    description: description,
                    amenities: amenities.length > 0 ? amenities : [],
                });
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch property details');
        } finally {
            setLoading(false);
        }
    };

    const saveToApi = async (status: 'draft' | 'submitted') => {
        if (!token || !regionCode) return;

        setLoading(true);
        setError(null);

        let backendPropertyType = 'APARTMENT';
        if (formData.propertyType === 'commercial') backendPropertyType = 'COMMERCIAL';
        else if (formData.propertyType === 'mixed-use') backendPropertyType = 'COMMERCIAL';

        const fullAddress = `${formData.address}${formData.city ? ', ' + formData.city : ''}${formData.state ? ', ' + formData.state : ''}${formData.pincode ? ' - ' + formData.pincode : ''}`;
        const fullDescription = `${formData.description}\n\nAmenities: ${formData.amenities.join(', ')}`;

        const payload = {
            name: formData.title,
            description: fullDescription,
            location: formData.location,
            address: fullAddress,
            // regionId removed as it is assigned later by onboarding manager

            status: status.toUpperCase(),
            price: parseFloat(formData.startingPrice) || 0,
            area: parseFloat(formData.totalArea) || 0,
            propertyType: backendPropertyType,
        };

        const url = propertyId
            ? `${API_URL}/api/${regionCode}/properties/${propertyId}`
            : `${API_URL}/api/${regionCode}/properties`;

        const method = propertyId ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                setPropertyId(data.id);
                return data.id;
            } else {
                const errData = await res.json();
                setError(errData.message || 'Failed to save property');
                throw new Error(errData.message || 'Failed to save');
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAmenityToggle = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity],
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'brochure' | 'specification') => {
        if (type === 'images') {
            setFiles(prev => ({
                ...prev,
                images: e.target.files ? Array.from(e.target.files) : [],
            }));
        } else {
            setFiles(prev => ({
                ...prev,
                [type]: e.target.files?.[0] || null,
            }));
        }
    };

    const handleNext = async () => {
        try {
            await saveToApi('draft');
            setCurrentStep(prev => Math.min(STEPS.length, prev + 1));
        } catch (e) { }
    };

    const handleSubmit = async () => {
        try {
            await saveToApi('draft');
            onSuccess();
            onClose();
        } catch (e) { }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return formData.title && formData.propertyType && formData.location && formData.address;
            case 2:
                return formData.city && formData.state && formData.pincode && formData.totalArea && formData.totalBuildings && formData.totalUnits;
            case 3:
                return formData.startingPrice && formData.description && formData.amenities.length > 0;
            default:
                return true;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                />

                <div className="relative overflow-hidden rounded-2xl bg-white text-left shadow-2xl sm:my-8 sm:w-full sm:max-w-4xl">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">{editId ? 'Edit Property' : 'Add New Property'}</h3>
                            <p className="text-sm text-gray-600 mt-1">Complete all steps to {editId ? 'update' : 'create'} a listing</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-8">
                        {/* Step Indicator */}
                        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
                            {STEPS.map((step, idx) => (
                                <div key={step.number} className="flex-1 min-w-[150px]">
                                    <div className="flex items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 transition ${currentStep >= step.number ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {step.number}
                                        </div>
                                        <div className="ml-3">
                                            <p className={`text-sm font-bold ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</p>
                                            <p className="text-[10px] text-gray-500 truncate">{step.description}</p>
                                        </div>
                                    </div>
                                    {idx < STEPS.length - 1 && (
                                        <div className={`mt-4 h-1 transition-all duration-500 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-100'}`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Form Content */}
                        <div className="min-h-[400px]">
                            {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">{error}</div>}

                            {currentStep === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Title *</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Sunset Heights, Sun Tower"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                            />
                                        </div>

                                        {/* Location Context Display */}
                                        <div className="col-span-2 grid grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Continent</label>
                                                <select
                                                    value={selectedContinent}
                                                    onChange={(e) => handleLocationChange('continent', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                                                >
                                                    <option value="">Select Continent</option>
                                                    {continents.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Country</label>
                                                <select
                                                    value={selectedCountryCode}
                                                    onChange={(e) => handleLocationChange('country', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                                                >
                                                    <option value="">Select Country</option>
                                                    {countries.map(c => <option key={c.id} value={c.code}>{c.emoji ? `${c.emoji} ` : ''}{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                                    State
                                                    {loadingLocations && states.length === 0 && <span className="ml-1 text-xs text-gray-400">Loading...</span>}
                                                </label>
                                                <select
                                                    value={selectedStateCode}
                                                    onChange={(e) => handleLocationChange('state', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                                                >
                                                    <option value="">Select State</option>
                                                    {states.map(state => (
                                                        <option key={state.id} value={state.code}>{state.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                                    City
                                                    {loadingLocations && cities.length === 0 && selectedStateCode && <span className="ml-1 text-xs text-gray-400">Loading...</span>}
                                                </label>
                                                <select
                                                    value={formData.city}
                                                    onChange={(e) => handleLocationChange('city', e.target.value)}
                                                    disabled={!selectedStateCode}
                                                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                                                >
                                                    <option value="">Select City</option>
                                                    {cities.map(city => (
                                                        <option key={city.id} value={city.name}>{city.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Type *</label>
                                            <select
                                                name="propertyType"
                                                value={formData.propertyType}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white"
                                            >
                                                {PROPERTY_TYPES.map(type => (
                                                    <option key={type.value} value={type.value}>{type.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Region / Locality *</label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Bandra West, Powai"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street Address *</label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="Full street address"
                                                rows={3}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">City *</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Mumbai"
                                                readOnly={!!activeContext.activeRegion.city}
                                                className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm ${activeContext.activeRegion.city ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">State *</label>
                                            {activeContext.activeRegion.state ? (
                                                <input
                                                    type="text"
                                                    value={formData.state}
                                                    readOnly
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed text-sm focus:outline-none"
                                                />
                                            ) : (
                                                <select
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white"
                                                >
                                                    <option value="">Select State</option>
                                                    {INDIAN_STATES.map(state => (
                                                        <option key={state} value={state}>{state}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode *</label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={formData.pincode}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 400050"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Area (Sq Ft) *</label>
                                            <input
                                                type="number"
                                                name="totalArea"
                                                value={formData.totalArea}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 500000"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Buildings *</label>
                                            <input
                                                type="number"
                                                name="totalBuildings"
                                                value={formData.totalBuildings}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 2"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Units *</label>
                                            <input
                                                type="number"
                                                name="totalUnits"
                                                value={formData.totalUnits}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 150"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Starting Price (₹) *</label>
                                        <input
                                            type="number"
                                            name="startingPrice"
                                            value={formData.startingPrice}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 5000000"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                        />
                                        {formData.startingPrice && (
                                            <p className="text-sm text-blue-600 font-bold mt-2">
                                                ₹{(parseInt(formData.startingPrice) / 100000).toFixed(1)} Lakhs
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Describe your property project in detail..."
                                            rows={4}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-4">Amenities *</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {AMENITIES_OPTIONS.map(amenity => (
                                                <label key={amenity} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${formData.amenities.includes(amenity) ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200' : 'border-gray-100 hover:bg-gray-50'
                                                    }`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.amenities.includes(amenity)}
                                                        onChange={() => handleAmenityToggle(amenity)}
                                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-xs font-semibold">{amenity}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100/50 transition-colors">
                                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm font-bold text-gray-900">Upload Property Media</p>
                                        <p className="text-xs text-gray-500 mt-1 mb-4">Upload high-quality images and brochures</p>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'images')}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brochure (PDF)</label>
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => handleFileChange(e, 'brochure')}
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Specifications (PDF)</label>
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => handleFileChange(e, 'specification')}
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="mt-10 flex gap-4 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                                disabled={currentStep === 1}
                                className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all"
                            >
                                Back
                            </button>
                            <div className="flex-1" />
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            {currentStep < STEPS.length ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={!isStepValid() || loading}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 transition-all flex items-center gap-2"
                                >
                                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    Save & Next
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 disabled:opacity-50 transition-all flex items-center gap-2"
                                >
                                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    Finish Listing
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
