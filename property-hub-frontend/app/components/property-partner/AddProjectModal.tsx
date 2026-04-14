
'use client';
import { useState, useEffect } from 'react';
import { Property, PropertyStatus } from '@/app/types/property';
import { PROPERTY_TYPES } from '@/app/constants/property';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { State, City } from 'country-state-city';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface StepConfig {
    number: number;
    title: string;
    description: string;
}

const PROJECT_CATEGORIES = [
    { value: 'flat', label: 'Flat / Apartment', description: 'Residential units in multi-story buildings' },
    { value: 'plot', label: 'Plot / Land', description: 'Vacant land for development' },
    { value: 'shop', label: 'Shop / Retail', description: 'Commercial retail spaces' },
    { value: 'villa', label: 'Villa / Independent House', description: 'Standalone residential properties' },
    { value: 'office', label: 'Office Space', description: 'Commercial office spaces' },
    { value: 'warehouse', label: 'Warehouse / Godown', description: 'Industrial storage spaces' },
];

const STEPS: StepConfig[] = [
    { number: 1, title: 'Basic Info', description: 'Title, category, and type' },
    { number: 2, title: 'Details', description: 'Area, towers, and units' },
    { number: 3, title: 'Address', description: 'Location details' },
    { number: 4, title: 'Pricing', description: 'Prices & amenities' },
    { number: 5, title: 'Documents', description: 'Media & brochures' },
];

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    editId: string | null;
    onSuccess: () => void;
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

export default function AddProjectModal({ isOpen, onClose, editId, onSuccess }: AddProjectModalProps) {
    const { token } = useAuth();
    const { activeContext } = useUnifiedApp();

    const [currentStep, setCurrentStep] = useState(1);
    const [projectCategory, setProjectCategory] = useState<string>('');
    const [projectId, setProjectId] = useState<string | null>(editId);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter steps: Only 1 step for new project quick-create, all 5 for editing/onboarding
    const activeSteps = editId ? STEPS : STEPS.slice(0, 1);

    const [formData, setFormData] = useState({
        title: '',
        propertyType: 'residential' as any,
        totalArea: '',
        totalTowers: '',
        totalUnits: '',
        startingPrice: '',
        description: '',
        amenities: [] as string[],
    });

    const [addressData, setAddressData] = useState({
        location: '',
        address: '',
        city: '',
        state: '',
    });

    const [files, setFiles] = useState({
        images: [] as File[],
        brochure: null as File | null,
        specification: null as File | null,
    });


    const [uploadedImages, setUploadedImages] = useState<string[]>([]);

    const [uploadingImages, setUploadingImages] = useState(false);

    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedStateCode, setSelectedStateCode] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(1);
            setProjectId(null);
            setError(null);
            return;
        }

        if (isOpen && editId && token) {
            fetchProjectDetails();
            fetchStates('IN');
        } else if (isOpen && !editId) {
            setFormData({
                title: '',
                propertyType: 'residential' as any,
                totalArea: '',
                totalTowers: '',
                totalUnits: '',
                startingPrice: '',
                description: '',
                amenities: [],
            });
            setAddressData({ location: '', address: '', city: '', state: '' });
            setFiles({ images: [], brochure: null, specification: null });

            setUploadedImages([]);
            setUploadingImages(false);
            setCurrentStep(1);
            setProjectCategory('');
            fetchStates('IN');
        }
    }, [isOpen, editId, token]);

    useEffect(() => {
        if (selectedStateCode) {
            fetchCities('IN', selectedStateCode);
        } else {
            setCities([]);
        }
    }, [selectedStateCode]);

    const fetchStates = async (cCode: string) => {
        try {
            const statesData = State.getStatesOfCountry(cCode);
            if (statesData && Array.isArray(statesData)) {
                const formattedStates = statesData.map((state: any) => ({
                    id: state.isoCode || state.name,
                    name: state.name,
                    code: state.isoCode,
                }));
                setStates(formattedStates);
            } else {
                setStates([]);
            }
        } catch (e) {
            console.error('Error fetching states:', e);
            setStates([]);
        }
    };

    const fetchCities = async (cCode: string, sCode: string) => {
        try {
            // Find the state name from the code
            const state = states.find(s => s.code === sCode);
            const stateName = state?.name || sCode;
            
            const res = await fetch(`${API_URL}/api/cities?state=${encodeURIComponent(stateName)}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            
            if (res.ok) {
                const citiesData = await res.json();
                setCities(citiesData.map((city: any) => ({
                    id: city.id,
                    name: city.name,
                })));
            } else {
                // Fallback to library if backend fails or returns empty
                const citiesData = City.getCitiesOfState(cCode, sCode);
                if (citiesData && Array.isArray(citiesData)) {
                    const formattedCities = citiesData.map((city: any) => ({
                        id: city.name,
                        name: city.name,
                    }));
                    setCities(formattedCities);
                }
            }
        } catch (e) {
            console.error('Error fetching cities:', e);
            setCities([]);
        }
    };

    const handleLocationChange = (type: 'state' | 'city', value: string) => {
        if (type === 'state') {
            const state = states.find(s => s.code === value);
            setSelectedStateCode(value);
            setAddressData(prev => ({ ...prev, state: state?.name || '' }));
            setCities([]);
            setAddressData(prev => ({ ...prev, city: '' }));
        } else if (type === 'city') {
            setAddressData(prev => ({ ...prev, city: value }));
        }
    };

    const fetchProjectDetails = async () => {
        if (!token || !editId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/projects/${editId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setProjectCategory(data.propertyType?.toLowerCase() || '');
                const description = data.description || '';
                let descPart = description;
                let amenities = [];
                if (description.includes('Amenities:')) {
                    const parts = description.split('Amenities:');
                    descPart = parts[0].trim();
                    amenities = parts[1].split(',').map((a: any) => a.trim());
                }

                setFormData({
                    title: data.name || '',
                    propertyType: data.propertyType || 'residential',
                    totalArea: data.area?.toString() || '',
                    totalTowers: data.totalTowers?.toString() || '',
                    totalUnits: data.totalUnits?.toString() || '',
                    startingPrice: data.price?.toString() || '',
                    description: descPart,
                    amenities: amenities,
                });

                // Extract address info from nested addressRecord
                const addr = data.addressRecord;
                const cityName = addr?.city?.name || '';
                const stateName = addr?.city?.state || '';

                setAddressData({
                    location: addr?.line2 || '',
                    address: addr?.line1 || '',
                    city: cityName,
                    state: stateName,
                });

                // If we have a state name, try to find the code to trigger city fetching
                if (stateName) {
                    const state = states.find(s => s.name === stateName);
                    if (state) {
                        setSelectedStateCode(state.code || '');
                    }
                }

                if (data.onboardingStep) {
                    // Adjust step for editing if it was saved using the old 6-step scheme
                    // In the new 5-step scheme, we might need a simple map or just use it
                    const savedStep = data.onboardingStep;
                    setCurrentStep(savedStep > 1 ? savedStep - 1 : 1);
                }


                setUploadedImages(data.images || []);
            }
        } catch (e) {
            console.error(e);
            setError('Failed to fetch project details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAddressData(prev => ({ ...prev, [name]: value }));
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'brochure' | 'specification') => {
        if (!token) return;
        const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
        if (selectedFiles.length === 0) return;

        if (type === 'images') {
            setUploadingImages(true);
            try {
                const newUrls: string[] = [];
                for (const file of selectedFiles) {
                    const fd = new FormData();
                    fd.append('file', file);
                    const res = await fetch(`${API_URL}/api/uploads`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: fd
                    });
                    if (res.ok) {
                        const data = await res.json();
                        newUrls.push(data.url);
                    }
                }
                setUploadedImages(prev => [...prev, ...newUrls]);
            } catch (err) {
                console.error(err);
                alert('Failed to upload images');
            } finally {
                setUploadingImages(false);
            }
        } else {
            // Handle brochure/spec (single file upload for simplicity or just keep as File if handled later)
            // For consistency, let's set them as File for now or upload them too
            setFiles(prev => ({
                ...prev,
                [type]: selectedFiles[0] || null,
            }));
        }
    };



    const handleNext = async () => {
        const nextStep = currentStep + 1;
        
        // Save progress if we have the minimum info (after step 1 now)
        if (currentStep >= 1 || projectId) {
            try {
                // In the new scheme, finishing Step 1 allows initial save
                // Change 'available' to 'draft' as requested
                await saveToApiWithStep('draft', nextStep);
            } catch (e) {
                if (currentStep === 1 && !projectId) return;
            }
        }
        
        setCurrentStep(Math.min(STEPS.length, nextStep));
    };

    const saveToApiWithStep = async (status: string, step: number) => {
        if (!token) return;

        setLoading(true);
        setError(null);

        let backendProjectType = 'APARTMENT';
        const cat = projectCategory.toLowerCase();
        if (cat === 'flat') backendProjectType = 'APARTMENT';
        else if (cat === 'villa') backendProjectType = 'VILLA';
        else if (cat === 'plot') backendProjectType = 'PLOT';
        else if (cat === 'shop' || cat === 'office') backendProjectType = 'COMMERCIAL';
        else if (cat === 'warehouse') backendProjectType = 'INDUSTRIAL';

        const fullDescription = formData.description;

        const selectedCity = cities.find(c => c.name === addressData.city);
        
        const payload: any = {
            name: formData.title,
            description: fullDescription,
            category: projectCategory.toUpperCase(),
            status: status.toUpperCase(),
            price: parseFloat(formData.startingPrice) || 0,
            area: parseFloat(formData.totalArea) || 0,
            totalTowers: parseInt(formData.totalTowers) || undefined,
            totalUnits: parseInt(formData.totalUnits) || undefined,
            projectType: backendProjectType,

            images: uploadedImages,
            onboardingStep: step,
            amenities: formData.amenities,
        };

        // Add addressRecord if city is selected with a valid ID
        if (selectedCity && selectedCity.id && selectedCity.id.length > 30) { // Check if it looks like a UUID
            payload.addressRecord = {
                line1: addressData.address,
                line2: addressData.location,
                cityId: selectedCity.id
            };
        }

        const url = projectId
            ? `${API_URL}/api/projects/${projectId}`
            : `${API_URL}/api/projects`;

        const method = projectId ? 'PATCH' : 'POST';

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
                setProjectId(data.id);
                return data.id;
            } else {
                const errData = await res.json();
                setError(errData.message || 'Failed to save progress');
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

    const handleSubmit = async () => {
        try {
            if (!editId && !projectId) {
                // Initial quick create - save as draft and move to Step 2 for next time
                await saveToApiWithStep('draft', 2);
            } else {
                // Completing the setup or updating existing
                await saveToApiWithStep('draft', STEPS.length);
            }
            onSuccess();
            onClose();
        } catch (e) { }
    };

    const isStepValid = () => {
        if (currentStep === 1) return !!projectCategory && !!formData.title && !!formData.propertyType;
        if (currentStep === 2) return !!formData.totalArea && !!formData.totalTowers && !!formData.totalUnits;
        if (currentStep === 3) return !!selectedStateCode && !!addressData.city && !!addressData.location && !!addressData.address;
        if (currentStep === 4) return !!formData.startingPrice && !!formData.description;
        return true;
    };

    const isFormComplete = () => {
        // For new project quick-create (only 1 step shown), only step 1 validation is needed
        if (!editId && !projectId) return isStepValid();
        
        // For full onboarding, everything is required
        return !!projectCategory &&
            !!formData.title &&
            !!formData.totalArea &&
            !!formData.totalTowers &&
            !!formData.totalUnits &&
            !!selectedStateCode && !!addressData.city && !!addressData.location && !!addressData.address &&
            !!formData.startingPrice && !!formData.description;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
                <div className="relative overflow-hidden rounded-2xl bg-white text-left shadow-2xl sm:my-8 sm:w-full sm:max-w-4xl">
                    <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">{editId ? 'Edit Project' : 'Add New Project'}</h3>
                            <p className="text-sm text-gray-600 mt-1">Complete all steps to {editId ? 'update' : 'create'} a listing</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
                            {activeSteps.map((step, idx) => (
                                <div key={step.number} className="flex-1 min-w-[120px] cursor-pointer group" onClick={() => setCurrentStep(step.number)}>
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition ${currentStep >= step.number ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                                            {step.number}
                                        </div>
                                        <div className="ml-3">
                                            <p className={`text-xs font-bold ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>{step.title}</p>
                                        </div>
                                    </div>
                                    {idx < activeSteps.length - 1 && <div className={`mt-4 h-1 transition-all duration-500 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-100'}`} />}
                                </div>
                            ))}
                        </div>

                        <div className="min-h-[400px]">
                            {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">{error}</div>}

                            {currentStep === 1 && (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Title *</label>
                                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Sunset Heights, Sun Tower" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Type *</label>
                                            <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white">
                                                {PROPERTY_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">Project Category *</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {PROJECT_CATEGORIES.map(category => (
                                                <button
                                                    key={category.value} type="button" onClick={() => setProjectCategory(category.value)}
                                                    className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${projectCategory === category.value ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-gray-100 hover:border-blue-200 bg-white'}`}
                                                >
                                                    <h4 className={`font-bold text-sm mb-1 ${projectCategory === category.value ? 'text-blue-700' : 'text-gray-900'}`}>{category.label}</h4>
                                                    <p className="text-[10px] text-gray-500 leading-tight">{category.description}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Area (Sq Ft) *</label>
                                            <input type="number" name="totalArea" value={formData.totalArea} onChange={handleInputChange} placeholder="e.g., 500000" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Towers *</label>
                                            <input type="number" name="totalTowers" value={formData.totalTowers} onChange={handleInputChange} placeholder="e.g., 2" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Units *</label>
                                            <input type="number" name="totalUnits" value={formData.totalUnits} onChange={handleInputChange} placeholder="e.g., 150" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">State</label>
                                            <select value={selectedStateCode} onChange={(e) => handleLocationChange('state', e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
                                                <option value="">Select State</option>
                                                {states.map(state => <option key={state.id} value={state.code}>{state.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">City</label>
                                            <select value={addressData.city} onChange={(e) => handleLocationChange('city', e.target.value)} disabled={!selectedStateCode} className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
                                                <option value="">Select City</option>
                                                {cities.map(city => <option key={city.name} value={city.name}>{city.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Locality *</label>
                                        <input type="text" name="location" value={addressData.location} onChange={handleAddressChange} placeholder="e.g., Bandra West, Powai" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street Address *</label>
                                        <textarea name="address" value={addressData.address} onChange={handleAddressChange} placeholder="Full street address" rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Starting Price (₹) *</label>
                                        <input type="number" name="startingPrice" value={formData.startingPrice} onChange={handleInputChange} placeholder="e.g., 5000000" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                                        {formData.startingPrice && <p className="text-sm text-blue-600 font-bold mt-2">₹{(parseInt(formData.startingPrice) / 100000).toFixed(1)} Lakhs</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                                        <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe your project in detail..." rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-4">Amenities</label>
                                        {/* Tag list */}
                                        {formData.amenities.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {formData.amenities.map(amenity => (
                                                    <span key={amenity} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium">
                                                        {amenity}
                                                        <button type="button" onClick={() => handleAmenityToggle(amenity)} className="text-blue-400 hover:text-red-500 transition-colors">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {/* Free-text input to add amenity */}
                                        <form onSubmit={(e) => { e.preventDefault(); const input = (e.currentTarget.elements.namedItem('amenityInput') as HTMLInputElement); if (input.value.trim() && !formData.amenities.includes(input.value.trim())) { handleAmenityToggle(input.value.trim()); input.value = ''; } }} className="flex gap-2">
                                            <input name="amenityInput" type="text" placeholder="e.g. Swimming Pool, Gym, Garden..." className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                                            <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">Add</button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100/50 transition-colors relative">
                                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <p className="text-sm font-bold text-gray-900">Upload Project Images</p>
                                        <p className="text-xs text-gray-500 mt-1 mb-4">Add high-quality photos for your listing</p>
                                        <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'images')} disabled={uploadingImages} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50" />
                                        
                                        {uploadedImages.length > 0 && (
                                            <div className="grid grid-cols-4 gap-2 mt-6 w-full">
                                                {uploadedImages.map((url, idx) => (
                                                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                                        <button onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-all shadow-lg">
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {uploadingImages && (
                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-10">
                                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brochure (PDF)</label>
                                            <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'brochure')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Specifications (PDF)</label>
                                            <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'specification')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700" />
                                        </div>
                                    </div>

                                </div>
                            )}

                        </div>

                        <div className="mt-10 flex gap-4 pt-6 border-t border-gray-100">
                            <button type="button" onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} disabled={currentStep === 1} className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all">Back</button>
                            <div className="flex-1" />
                            <button type="button" onClick={onClose} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700">Cancel</button>
                            {currentStep < activeSteps.length ? (
                                <button type="button" onClick={handleNext} disabled={!isStepValid() || loading} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 transition-all flex items-center gap-2">
                                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    Next
                                </button>
                            ) : (
                                <button type="button" onClick={handleSubmit} disabled={loading || !isFormComplete()} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 disabled:opacity-50 transition-all flex items-center gap-2">
                                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    {(!editId && !projectId) ? 'Create Project' : 'Save Project'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
