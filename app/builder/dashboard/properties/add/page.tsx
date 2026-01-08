'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Property } from '@/app/types/property';
import { PROPERTY_TYPES, AMENITIES_OPTIONS, INDIAN_STATES } from '@/app/constants/property';

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

export default function AddPropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    propertyType: 'residential' as const,
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

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('property_draft', JSON.stringify({ formData, files: { images: [], brochure: null, specification: null } }));
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('total') || name === 'startingPrice' ? (value === '' ? '' : value) : value,
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

  const handleSubmit = () => {
    const properties: Property[] = JSON.parse(localStorage.getItem('builder_properties') || '[]');
    
    const newProperty: Property = {
      id: `prop_${Date.now()}`,
      title: formData.title,
      propertyType: formData.propertyType,
      location: formData.location,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      totalArea: parseInt(formData.totalArea) || 0,
      totalBuildings: parseInt(formData.totalBuildings) || 0,
      totalUnits: parseInt(formData.totalUnits) || 0,
      startingPrice: parseInt(formData.startingPrice) || 0,
      description: formData.description,
      amenities: formData.amenities,
      images: files.images,
      brochure: files.brochure || undefined,
      specification: files.specification || undefined,
      status: 'draft',
      createdAt: new Date(),
      buildings: [],
    };

    properties.push(newProperty);
    localStorage.setItem('builder_properties', JSON.stringify(properties));
    localStorage.removeItem('property_draft');
    router.push('/builder/dashboard/properties');
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
        <p className="text-gray-600 mt-1">Complete all steps to create a new property listing</p>
      </div>

      {/* Step Indicator */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="flex-1">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                    currentStep >= step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.number}
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-600">{step.description}</p>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`mt-4 h-1 transition ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Property Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Sunset Heights, Sun Tower"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type *</label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PROPERTY_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location/Project Name *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Bandra, Mumbai"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Full address"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Property Details</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., Mumbai"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="e.g., 400050"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Area (Sq Ft) *</label>
                <input
                  type="number"
                  name="totalArea"
                  value={formData.totalArea}
                  onChange={handleInputChange}
                  placeholder="e.g., 500000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Buildings *</label>
                <input
                  type="number"
                  name="totalBuildings"
                  value={formData.totalBuildings}
                  onChange={handleInputChange}
                  placeholder="e.g., 2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Units *</label>
                <input
                  type="number"
                  name="totalUnits"
                  value={formData.totalUnits}
                  onChange={handleInputChange}
                  placeholder="e.g., 150"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Pricing & Amenities</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Starting Price (₹) *</label>
              <input
                type="number"
                name="startingPrice"
                value={formData.startingPrice}
                onChange={handleInputChange}
                placeholder="e.g., 5000000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.startingPrice && (
                <p className="text-sm text-gray-600 mt-1">
                  ₹{(parseInt(formData.startingPrice) / 100000).toFixed(1)} Lakhs
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your property..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">Amenities *</label>
              <div className="grid md:grid-cols-2 gap-3">
                {AMENITIES_OPTIONS.map(amenity => (
                  <label key={amenity} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Documents & Media</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Property Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'images')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {files.images.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">{files.images.length} images selected</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Brochure (PDF)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, 'brochure')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {files.brochure && (
                <p className="text-sm text-gray-600 mt-2">✓ {files.brochure.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Specifications (PDF)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, 'specification')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {files.specification && (
                <p className="text-sm text-gray-600 mt-2">✓ {files.specification.name}</p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex gap-4 justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(STEPS.length, prev + 1))}
              disabled={!isStepValid()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
            >
              Create Property
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
