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

const PROPERTY_CATEGORIES = [
    { value: 'flat', label: 'Flat / Apartment', description: 'Residential units in multi-story buildings' },
    { value: 'plot', label: 'Plot / Land', description: 'Vacant land for development' },
    { value: 'shop', label: 'Shop / Retail', description: 'Commercial retail spaces' },
    { value: 'villa', label: 'Villa / Independent House', description: 'Standalone residential properties' },
    { value: 'office', label: 'Office Space', description: 'Commercial office spaces' },
    { value: 'warehouse', label: 'Warehouse / Godown', description: 'Industrial storage spaces' },
];

const STEPS: StepConfig[] = [
    { number: 1, title: 'Category', description: 'Select property type' },
    { number: 2, title: 'Basic Info', description: 'Title, type, and location' },
    { number: 3, title: 'Details', description: 'Area, buildings, and units' },
];

interface AddPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    editId: string | null;
    onSuccess: () => void;
}

export default function AddPropertyModal({ isOpen, onClose, editId, onSuccess }: AddPropertyModalProps) {
    const { token } = useAuth();
    const { activeContext } = useUnifiedApp();

    const [currentStep, setCurrentStep] = useState(1); // Start at category selection (Step 1)
    const [propertyCategory, setPropertyCategory] = useState<string>(''); // Selected category
    const [propertyId, setPropertyId] = useState<string | null>(editId);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        propertyType: 'residential' as any,
        totalArea: '',
        totalBuildings: '',
        totalUnits: '',
        startingPrice: '', // We keep these for type safety but they won't be filled here
        description: '',
        amenities: [] as string[],
    });

    const [files, setFiles] = useState({
        images: [] as File[],
        brochure: null as File | null,
        specification: null as File | null,
    });

    // Initial Fetch
    useEffect(() => {
        if (isOpen && token) {
            // No location pre-fetching needed here anymore
        }
    }, [isOpen, token]);

    // Re-declare handleInputChange locally to avoid shadowing or just use existing

    // Reset or Load existing property
    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(1);
            setPropertyId(null);
            setError(null);
            return;
        }

        if (isOpen && editId && token) {
            fetchPropertyDetails();
        } else if (isOpen && !editId) {
            setFormData({
                title: '',
                propertyType: 'residential' as any,
                totalArea: '',
                totalBuildings: '',
                totalUnits: '',
                startingPrice: '',
                description: '',
                amenities: [],
            });
            setCurrentStep(1);
            setPropertyCategory('');
        }
    }, [isOpen, editId, token]);

    const fetchPropertyDetails = async () => {
        if (!token || !editId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/projects/${editId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();

                // Set Category based on backend propertyType or other logic
                // For now, mapping residential -> flat, etc. or keeping it simple
                setPropertyCategory(data.propertyType?.toLowerCase() || '');

                const description = data.description || '';
                const amenitiesPart = description.split('\n\nAmenities: ')[1];
                const amenities = amenitiesPart ? amenitiesPart.split(', ') : [];

                setFormData({
                    title: data.name || '',
                    propertyType: data.propertyType || 'residential',
                    totalArea: data.area?.toString() || '',
                    totalBuildings: '',
                    totalUnits: '',
                    startingPrice: data.price?.toString() || '',
                    description: description,
                    amenities: amenities.length > 0 ? amenities : [],
                });
            }
        } catch (e) {
            console.error(e);
            setError('Failed to fetch property details');
        } finally {
            setLoading(false);
        }
    };


    const saveToApi = async (status: string) => {
        if (!token) return;

        setLoading(true);
        setError(null);

        let backendPropertyType = 'APARTMENT';
        if (formData.propertyType === 'commercial') backendPropertyType = 'COMMERCIAL';
        else if (formData.propertyType === 'mixed-use') backendPropertyType = 'COMMERCIAL';

        const fullDescription = `${formData.description}\n\nAmenities: ${formData.amenities.join(', ')}`;

        const payload = {
            name: formData.title,
            description: fullDescription,
            category: propertyCategory.toUpperCase(),
            location: formData.title, // Provide title as temporary location string (required by backend)


            status: status.toUpperCase(),
            price: parseFloat(formData.startingPrice) || 0,
            area: parseFloat(formData.totalArea) || 0,
            propertyType: backendPropertyType,
        };

        const url = propertyId
            ? `${API_URL}/api/projects/${propertyId}`
            : `${API_URL}/api/projects`;

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

    const handleNext = () => {
        setCurrentStep(prev => Math.min(STEPS.length, prev + 1));
    };

    const handleSubmit = async () => {
        try {
            await saveToApi('available');
            onSuccess();
            onClose();
        } catch (e) { }
    };

    const isStepValid = () => {
        if (currentStep === 1) return !!propertyCategory;
        if (currentStep === 2) {
            return !!formData.title && !!formData.propertyType;
        }
        if (currentStep === 3) {
            return !!formData.totalArea && !!formData.totalBuildings && !!formData.totalUnits;
        }
        return true;
    };

    const isFormComplete = () => {
        return !!propertyCategory &&
            !!formData.title &&
            !!formData.totalArea &&
            !!formData.totalBuildings &&
            !!formData.totalUnits;
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
                                <div
                                    key={step.number}
                                    className="flex-1 min-w-[150px] cursor-pointer group"
                                    onClick={() => setCurrentStep(step.number)}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 transition ${currentStep >= step.number ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                                            }`}>
                                            {step.number}
                                        </div>
                                        <div className="ml-3">
                                            <p className={`text-sm font-bold ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>{step.title}</p>
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
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">What type of property are you adding?</h3>
                                        <p className="text-sm text-gray-600">Select the category that best describes your property</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {PROPERTY_CATEGORIES.map(category => (
                                            <button
                                                key={category.value}
                                                type="button"
                                                onClick={() => setPropertyCategory(category.value)}
                                                className={`p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${propertyCategory === category.value
                                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                    : 'border-gray-200 hover:border-blue-300 bg-white'
                                                    }`}
                                            >
                                                <h4 className={`font-bold mb-1 ${propertyCategory === category.value ? 'text-blue-700' : 'text-gray-900'}`}>
                                                    {category.label}
                                                </h4>
                                                <p className="text-xs text-gray-600">{category.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
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

                                        <div className="col-span-2">
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
                                    </div>
                                </div>
                            )}


                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
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
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading || !isFormComplete()}
                                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 disabled:opacity-50 transition-all flex items-center gap-2"
                                >
                                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    Save Property
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
