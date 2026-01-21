'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SocietyFormData, PossessionStatus } from '@/app/types/society';

const STEPS = [
    { id: 1, title: 'Basic Info', description: 'Society details' },
    { id: 2, title: 'Structure', description: 'Towers & amenities' },
    { id: 3, title: 'Roles', description: 'Assign Regional Manager' },
    { id: 4, title: 'Review', description: 'Confirm & create' },
];

const AMENITY_OPTIONS = [
    'Parking', 'Clubhouse', 'Swimming Pool', 'Gym', 'Garden', 'Lift',
    'Security', 'Children Play Area', 'Jogging Track', 'Community Hall'
];

const INITIAL_FORM_STATE: SocietyFormData = {
    name: '',
    projectName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    possessionStatus: 'ready',
    towers: [{ name: 'Tower A', totalFloors: 10, floorStart: 1, unitsPerFloor: 4, flatNumberingPattern: '101, 102...', totalUnits: 40 }],
    amenities: [],
    regionalManagerName: '',
    regionalManagerEmail: '',
    regionalManagerMobile: '',
};

export default function CreateSocietyPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<SocietyFormData>(INITIAL_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTowerChange = (index: number, field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            towers: prev.towers.map((tower, idx) =>
                idx === index ? {
                    ...tower, [field]: value, totalUnits: field === 'totalFloors' || field === 'unitsPerFloor'
                        ? (field === 'totalFloors' ? Number(value) : tower.totalFloors) * (field === 'unitsPerFloor' ? Number(value) : tower.unitsPerFloor)
                        : tower.totalUnits
                } : tower
            ),
        }));
    };

    const addTower = () => {
        const nextLetter = String.fromCharCode(65 + formData.towers.length);
        setFormData(prev => ({
            ...prev,
            towers: [...prev.towers, { name: `Tower ${nextLetter}`, totalFloors: 10, floorStart: 1, unitsPerFloor: 4, flatNumberingPattern: '101, 102...', totalUnits: 40 }],
        }));
    };

    const removeTower = (index: number) => {
        if (formData.towers.length > 1) {
            setFormData(prev => ({
                ...prev,
                towers: prev.towers.filter((_, idx) => idx !== index),
            }));
        }
    };

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity],
        }));
    };

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // In real implementation, this would call an API to create the society
        console.log('Creating society:', formData);
        router.push('/property-partner/society');
    };

    const totalUnits = formData.towers.reduce((sum, t) => sum + t.totalUnits, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Link href="/property-partner/dashboard" className="hover:text-gray-900">Dashboard</Link>
                        <span>→</span>
                        <Link href="/property-partner/society" className="hover:text-gray-900">Societies</Link>
                        <span>→</span>
                        <span className="text-gray-900 font-medium">Create Society</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Society</h1>
                    <p className="text-gray-600 mt-1">Set up a digital society for post-handover management</p>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, idx) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${currentStep > step.id ? 'bg-green-600 text-white' :
                                    currentStep === step.id ? 'bg-blue-600 text-white' :
                                        'bg-gray-200 text-gray-600'
                                    }`}>
                                    {currentStep > step.id ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : step.id}
                                </div>
                                <div className="ml-3 hidden sm:block">
                                    <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-gray-500">{step.description}</p>
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div className={`h-0.5 w-12 sm:w-20 mx-4 ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">

                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Basic Information</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Society Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Sunset Heights Society"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Project Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="projectName"
                                        value={formData.projectName}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Sunset Towers"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows={2}
                                    placeholder="Full address"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Mumbai"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Maharashtra"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Pincode <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 400001"
                                        maxLength={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Possession Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="possessionStatus"
                                        value={formData.possessionStatus}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="under-construction">Under Construction</option>
                                        <option value="ready">Ready for Possession</option>
                                        <option value="handed-over">Handed Over</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Expected Handover Date
                                    </label>
                                    <input
                                        type="date"
                                        name="expectedHandoverDate"
                                        value={formData.expectedHandoverDate || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Structure */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Society Structure</h2>
                                <button
                                    type="button"
                                    onClick={addTower}
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Tower
                                </button>
                            </div>

                            {/* Towers */}
                            <div className="space-y-4">
                                {formData.towers.map((tower, idx) => (
                                    <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-gray-900">{tower.name || `Tower ${idx + 1}`}</h3>
                                            {formData.towers.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTower(idx)}
                                                    className="text-red-600 hover:text-red-700 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Tower Name</label>
                                                <input
                                                    type="text"
                                                    value={tower.name}
                                                    onChange={(e) => handleTowerChange(idx, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Total Floors</label>
                                                <input
                                                    type="number"
                                                    value={tower.totalFloors}
                                                    onChange={(e) => handleTowerChange(idx, 'totalFloors', Number(e.target.value))}
                                                    min="1"
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Units per Floor</label>
                                                <input
                                                    type="number"
                                                    value={tower.unitsPerFloor}
                                                    onChange={(e) => handleTowerChange(idx, 'unitsPerFloor', Number(e.target.value))}
                                                    min="1"
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Total Units</label>
                                                <input
                                                    type="text"
                                                    value={tower.totalUnits}
                                                    disabled
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm font-semibold text-blue-900 mb-1">Structure Summary</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {formData.towers.length} Tower{formData.towers.length > 1 ? 's' : ''} • {totalUnits} Units
                                </p>
                            </div>

                            {/* Amenities */}
                            <div>
                                <h3 className="text-md font-semibold text-gray-900 mb-4">Common Amenities</h3>
                                <div className="flex flex-wrap gap-2">
                                    {AMENITY_OPTIONS.map((amenity) => (
                                        <button
                                            key={amenity}
                                            type="button"
                                            onClick={() => toggleAmenity(amenity)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${formData.amenities.includes(amenity)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {amenity}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Roles */}
                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Assign Initial Roles</h2>

                            {/* Regional Manager */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">RM</span>
                                    Regional Manager <span className="text-red-500">*</span>
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="regionalManagerName"
                                            value={formData.regionalManagerName}
                                            onChange={handleInputChange}
                                            placeholder="Manager name"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="regionalManagerEmail"
                                            value={formData.regionalManagerEmail}
                                            onChange={handleInputChange}
                                            placeholder="manager@example.com"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Mobile</label>
                                        <input
                                            type="tel"
                                            name="regionalManagerMobile"
                                            value={formData.regionalManagerMobile}
                                            onChange={handleInputChange}
                                            placeholder="+91 9876543210"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Manager (Optional) */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm">M</span>
                                    Society Manager <span className="text-gray-400 text-sm font-normal">(Optional)</span>
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="managerName"
                                            value={formData.managerName || ''}
                                            onChange={handleInputChange}
                                            placeholder="Manager name"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="managerEmail"
                                            value={formData.managerEmail || ''}
                                            onChange={handleInputChange}
                                            placeholder="manager@example.com"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Mobile</label>
                                        <input
                                            type="tel"
                                            name="managerMobile"
                                            value={formData.managerMobile || ''}
                                            onChange={handleInputChange}
                                            placeholder="+91 9876543210"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Supervisor (Optional) */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm">S</span>
                                    Maintenance Supervisor <span className="text-gray-400 text-sm font-normal">(Optional)</span>
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="supervisorName"
                                            value={formData.supervisorName || ''}
                                            onChange={handleInputChange}
                                            placeholder="Supervisor name"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="supervisorEmail"
                                            value={formData.supervisorEmail || ''}
                                            onChange={handleInputChange}
                                            placeholder="supervisor@example.com"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Mobile</label>
                                        <input
                                            type="tel"
                                            name="supervisorMobile"
                                            value={formData.supervisorMobile || ''}
                                            onChange={handleInputChange}
                                            placeholder="+91 9876543210"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Review & Confirm</h2>

                            {/* Basic Info Summary */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Society Name</p>
                                        <p className="font-medium text-gray-900">{formData.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Project Name</p>
                                        <p className="font-medium text-gray-900">{formData.projectName || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Location</p>
                                        <p className="font-medium text-gray-900">{formData.city}, {formData.state} - {formData.pincode}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Possession Status</p>
                                        <p className="font-medium text-gray-900 capitalize">{formData.possessionStatus.replace('-', ' ')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Structure Summary */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Structure</h3>
                                <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                                    <div>
                                        <p className="text-gray-500">Total Towers</p>
                                        <p className="text-2xl font-bold text-blue-600">{formData.towers.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Total Units</p>
                                        <p className="text-2xl font-bold text-green-600">{totalUnits}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Amenities</p>
                                        <p className="text-2xl font-bold text-purple-600">{formData.amenities.length}</p>
                                    </div>
                                </div>
                                {formData.amenities.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.amenities.map(amenity => (
                                            <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Roles Summary */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Assigned Roles</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">RM</span>
                                        <div>
                                            <p className="font-medium text-gray-900">{formData.regionalManagerName || 'Not assigned'}</p>
                                            <p className="text-gray-500">{formData.regionalManagerEmail} • {formData.regionalManagerMobile}</p>
                                        </div>
                                    </div>
                                    {formData.managerName && (
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">M</span>
                                            <div>
                                                <p className="font-medium text-gray-900">{formData.managerName}</p>
                                                <p className="text-gray-500">{formData.managerEmail} • {formData.managerMobile}</p>
                                            </div>
                                        </div>
                                    )}
                                    {formData.supervisorName && (
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">S</span>
                                            <div>
                                                <p className="font-medium text-gray-900">{formData.supervisorName}</p>
                                                <p className="text-gray-500">{formData.supervisorEmail} • {formData.supervisorMobile}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notice */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-amber-800">Before you proceed</p>
                                        <p className="text-sm text-amber-700 mt-1">
                                            Once created, the society will be in &quot;Property Partner Managed&quot; status. You can invite members and transfer control to RWA later.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={() => router.push('/property-partner/society')}
                        className="px-6 py-3 text-gray-700 font-semibold hover:text-gray-900 transition"
                    >
                        Cancel
                    </button>
                    <div className="flex items-center gap-3">
                        {currentStep > 1 && (
                            <button
                                onClick={handlePrevious}
                                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
                            >
                                Previous
                            </button>
                        )}
                        {currentStep < STEPS.length ? (
                            <button
                                onClick={handleNext}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    <>Create Society</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
