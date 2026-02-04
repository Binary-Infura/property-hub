'use client';
import { useState, useEffect } from 'react';
import { Property, PropertyStatus } from '@/app/types/property';
import { PROPERTY_STATUS_CONFIG, AMENITIES_OPTIONS } from '@/app/constants/property';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SelectPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SelectPropertyModal({ isOpen, onClose, onSuccess }: SelectPropertyModalProps) {
    const { token } = useAuth();
    const { activeContext } = useUnifiedApp();
    const regionCode = activeContext.activeRegion.code;

    const [step, setStep] = useState(1);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [submittingId, setSubmittingId] = useState<string | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);

    // Form Data for Step 2
    const [pricingData, setPricingData] = useState({
        startingPrice: '',
        description: '',
        amenities: [] as string[],
    });

    const [files, setFiles] = useState({
        images: [] as File[],
        brochure: null as File | null,
        specification: null as File | null,
    });

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSelectedPropertyId(null);
            setPricingData({ startingPrice: '', description: '', amenities: [] });
            setFiles({ images: [], brochure: null, specification: null });
            fetchAvailableProperties();
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'brochure' | 'specification') => {
        if (e.target.files && e.target.files.length > 0) {
            if (type === 'images') {
                setFiles(prev => ({ ...prev, images: [...prev.images, ...Array.from(e.target.files!)] }));
            } else {
                setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
            }
        }
    };

    const handlePricingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPricingData(prev => ({ ...prev, [name]: value }));
    };

    const handleAmenityChange = (amenity: string) => {
        setPricingData(prev => {
            const current = prev.amenities;
            if (current.includes(amenity)) {
                return { ...prev, amenities: current.filter(a => a !== amenity) };
            } else {
                return { ...prev, amenities: [...current, amenity] };
            }
        });
    };

    const fetchAvailableProperties = async () => {
        if (!token || !regionCode) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/${regionCode}/properties?myOnly=true`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const allProps = data
                    .map((p: any) => ({
                        id: p.id,
                        title: p.name,
                        location: p.location,
                        startingPrice: parseFloat(p.price) || 0,
                        status: p.status?.toLowerCase() as PropertyStatus,
                    }));
                setProperties(allProps);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleNextStep = () => {
        if (step === 1 && selectedPropertyId) {
            setStep(2);
        } else if (step === 2) {
            // Validate Step 2
            if (pricingData.startingPrice && pricingData.description && pricingData.amenities.length > 0) {
                setStep(3);
            } else {
                alert("Please fill all pricing details including description and amenities.");
            }
        }
    };

    const handleSubmit = async () => {
        if (!token || !regionCode || !selectedPropertyId) return;
        setSubmittingId(selectedPropertyId);

        try {
            // 1. Update Property with Status = SUBMITTED AND Pricing Data
            // Combine description with amenities as per AddPropertyModal pattern
            const fullDescription = `${pricingData.description}\n\nAmenities: ${pricingData.amenities.join(', ')}`;

            const payload = {
                status: 'SUBMITTED',
                price: parseFloat(pricingData.startingPrice) || 0,
                description: fullDescription,
            };

            const res = await fetch(`${API_URL}/api/${regionCode}/properties/${selectedPropertyId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // 2. Upload Files 
                onSuccess();
                onClose();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmittingId(null);
        }
    };

    if (!isOpen) return null;

    const getStepTitle = () => {
        switch (step) {
            case 1: return 'Select Property';
            case 2: return 'Pricing & Details';
            case 3: return 'Upload Documents';
            default: return '';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                />

                <div className="relative overflow-hidden rounded-2xl bg-white text-left shadow-2xl sm:my-8 sm:w-full sm:max-w-3xl">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-xl font-bold text-gray-900">{getStepTitle()} <span className="text-gray-400 text-sm font-normal ml-2">(Step {step} of 3)</span></h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {step === 1 ? (
                            loading ? (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    Loading available properties...
                                </div>
                            ) : properties.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 font-medium">No available properties found.</p>
                                    <p className="text-sm text-gray-400 mt-1">Add properties in "My Properties" first.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {properties.map(property => {
                                        const isAlreadySubmitted = ['submitted', 'approved', 'published'].includes(property.status);
                                        const isSelected = selectedPropertyId === property.id;

                                        return (
                                            <div
                                                key={property.id}
                                                onClick={() => !isAlreadySubmitted && setSelectedPropertyId(property.id)}
                                                className={`flex items-center justify-between p-4 border rounded-xl transition-all ${isAlreadySubmitted
                                                        ? 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-75'
                                                        : isSelected
                                                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 cursor-pointer'
                                                            : 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                                                    }`}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className={`font-bold ${isAlreadySubmitted ? 'text-gray-400' : 'text-gray-900'}`}>{property.title}</h4>
                                                        {isAlreadySubmitted && (
                                                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-500">
                                                                Already {property.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 truncate max-w-[400px]">{property.location}</p>
                                                    {!isAlreadySubmitted && (
                                                        <p className="text-xs text-emerald-600 font-semibold mt-1">Available to List</p>
                                                    )}
                                                </div>

                                                <div className="ml-4">
                                                    {isAlreadySubmitted ? (
                                                        <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                                            {isSelected && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        ) : step === 2 ? (
                            // Step 2: Pricing
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Starting Price (₹) *</label>
                                    <input
                                        type="number"
                                        name="startingPrice"
                                        value={pricingData.startingPrice}
                                        onChange={handlePricingChange}
                                        placeholder="e.g., 5000000"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                    />
                                    {pricingData.startingPrice && (
                                        <p className="text-sm text-blue-600 font-bold mt-2">
                                            ₹{(parseInt(pricingData.startingPrice) / 100000).toFixed(1)} Lakhs
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                                    <textarea
                                        name="description"
                                        value={pricingData.description}
                                        onChange={handlePricingChange}
                                        placeholder="Describe your property project in detail..."
                                        rows={4}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-4">Amenities *</label>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                        {AMENITIES_OPTIONS.map(amenity => (
                                            <label
                                                key={amenity}
                                                className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${pricingData.amenities.includes(amenity)
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={amenity}
                                                    checked={pricingData.amenities.includes(amenity)}
                                                    onChange={() => handleAmenityChange(amenity)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                                                />
                                                <span className="text-sm font-medium">{amenity}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Step 3: Documents
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
                                    {files.images.length > 0 && <p className="text-sm text-green-600 mt-2">{files.images.length} images selected</p>}
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

                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(prev => prev - 1)}
                                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition"
                            >
                                Back
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition"
                            >
                                Cancel
                            </button>
                        )}

                        {step < 3 ? (
                            <button
                                onClick={handleNextStep}
                                disabled={step === 1 && !selectedPropertyId}
                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-200"
                            >
                                Next: {step === 1 ? 'Pricing' : 'Documents'}
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!!submittingId}
                                className="px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 transition shadow-lg shadow-green-200 flex items-center gap-2"
                            >
                                {submittingId && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                Submit for Review
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
