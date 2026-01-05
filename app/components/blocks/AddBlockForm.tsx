'use client';

import { useState, useEffect } from 'react';
import { BlockFormData, BlockFormErrors } from '@/app/types/block';
import { BLOCK_TYPES, BLOCK_STATUSES, UNIT_TYPES, ADD_BLOCK_STEPS } from '@/app/constants/block';
import StepIndicator from './StepIndicator';
import {
  validateStep,
  suggestBlockCode,
  formatIndianPrice,
} from '@/app/utils/blockValidation';
import { calculateTotalUnits } from '@/app/utils/blockPricing';

interface AddBlockFormProps {
  projectId: string;
  buildingId: string;
  buildingName: string;
  projectName: string;
  initialData?: Partial<BlockFormData>;
  onSave: (data: BlockFormData) => void;
  onPublish: (data: BlockFormData) => void;
  onCancel: () => void;
}

const INITIAL_FORM_STATE: BlockFormData = {
  name: '',
  code: '',
  type: 'residential',
  status: 'pre-launch',
  possessionDate: '',
  totalFloors: '',
  unitsPerFloor: '',
  liftCount: '',
  fireExitCount: '',
  basePricePerSqft: '',
  floorRisePricePerFloor: '',
  unitTypePricing: [
    { type: '2BHK', basePrice: '', units: '' },
    { type: '3BHK', basePrice: '', units: '' },
  ],
  offersEnabled: false,
  offerDescription: '',
  showOnPortal: true,
  allowChannelPartners: false,
  allowConsultants: false,
  eligibleForBoostCampaigns: false,
};

export default function AddBlockForm({
  projectId,
  buildingId,
  buildingName,
  projectName,
  initialData,
  onSave,
  onPublish,
  onCancel,
}: AddBlockFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BlockFormData>(initialData || INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<BlockFormErrors>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [codeAutoSuggested, setCodeAutoSuggested] = useState(!initialData);

  // Auto-calculate total units
  const totalUnits = calculateTotalUnits(
    parseInt(String(formData.totalFloors), 10) || 0,
    parseInt(String(formData.unitsPerFloor), 10) || 0,
  );

  // Auto-save draft
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (formData.name) {
        localStorage.setItem(`block-draft-${buildingId}`, JSON.stringify(formData));
      }
    }, 1000);

    return () => clearTimeout(autoSaveTimer);
  }, [formData, buildingId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));

      // Auto-suggest block code based on name
      if (name === 'name' && codeAutoSuggested && !initialData) {
        setFormData(prev => ({
          ...prev,
          code: suggestBlockCode(value),
        }));
      }
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleUnitTypePricingChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    setFormData(prev => ({
      ...prev,
      unitTypePricing: prev.unitTypePricing.map((pricing, idx) =>
        idx === index ? { ...pricing, [field]: value } : pricing,
      ),
    }));

    // Clear field errors
    const errorKey = `unitTypePricing_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addUnitTypePricing = () => {
    setFormData(prev => ({
      ...prev,
      unitTypePricing: [...prev.unitTypePricing, { type: '', basePrice: '', units: '' }],
    }));
  };

  const removeUnitTypePricing = (index: number) => {
    setFormData(prev => ({
      ...prev,
      unitTypePricing: prev.unitTypePricing.filter((_, idx) => idx !== index),
    }));
  };

  const validateCurrentStep = (): boolean => {
    const stepErrors = validateStep(currentStep, formData);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      if (currentStep < ADD_BLOCK_STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (completedSteps.includes(step) || step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (validateCurrentStep()) {
      setIsSaving(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        onPublish(formData);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-transparent">
        <div className="max-w-4xl">
          <h1 className="text-2xl font-bold text-gray-900">Add New Block</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <span className="font-medium">{projectName}</span>
            <span>→</span>
            <span className="font-medium">{buildingName}</span>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator
        currentStep={currentStep}
        totalSteps={ADD_BLOCK_STEPS.length}
        onStepClick={handleStepClick}
        completedSteps={completedSteps}
      />

      {/* Form Content */}
      <div className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
        {/* Step 1: Block Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Block Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Block A, North Tower"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.name
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Block Code <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  maxLength={10}
                  placeholder="e.g., A, BLK-A"
                  className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 font-mono transition ${
                    errors.code
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      code: suggestBlockCode(formData.name),
                    }));
                    setCodeAutoSuggested(true);
                  }}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition"
                >
                  Auto-suggest
                </button>
              </div>
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Block Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white transition ${
                    errors.type
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Launch Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white transition ${
                    errors.status
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                >
                  <option value="pre-launch">Pre-Launch</option>
                  <option value="active">Active</option>
                  <option value="hold">Hold</option>
                  <option value="sold-out">Sold Out</option>
                </select>
                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Possession Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="possessionDate"
                value={formData.possessionDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.possessionDate
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.possessionDate && (
                <p className="text-red-500 text-sm mt-1">{errors.possessionDate}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Structure Details */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Total Floors <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalFloors"
                  value={formData.totalFloors}
                  onChange={handleInputChange}
                  placeholder="e.g., 20"
                  min="1"
                  max="100"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.totalFloors
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.totalFloors && (
                  <p className="text-red-500 text-sm mt-1">{errors.totalFloors}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Units per Floor <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="unitsPerFloor"
                  value={formData.unitsPerFloor}
                  onChange={handleInputChange}
                  placeholder="e.g., 4"
                  min="1"
                  max="50"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.unitsPerFloor
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.unitsPerFloor && (
                  <p className="text-red-500 text-sm mt-1">{errors.unitsPerFloor}</p>
                )}
              </div>
            </div>

            {/* Total Units Read-Only Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-1">Total Units (Auto-calculated)</p>
              <p className="text-3xl font-bold text-blue-600">{totalUnits}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Lift Count
                </label>
                <input
                  type="number"
                  name="liftCount"
                  value={formData.liftCount}
                  onChange={handleInputChange}
                  placeholder="e.g., 2"
                  min="0"
                  max="20"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.liftCount
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.liftCount && (
                  <p className="text-red-500 text-sm mt-1">{errors.liftCount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Fire Exit Count
                </label>
                <input
                  type="number"
                  name="fireExitCount"
                  value={formData.fireExitCount}
                  onChange={handleInputChange}
                  placeholder="e.g., 2"
                  min="0"
                  max="10"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.fireExitCount
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.fireExitCount && (
                  <p className="text-red-500 text-sm mt-1">{errors.fireExitCount}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Pricing Configuration */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Base Price (₹/sq ft) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="basePricePerSqft"
                  value={formData.basePricePerSqft}
                  onChange={handleInputChange}
                  placeholder="e.g., 5000"
                  min="0"
                  step="100"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.basePricePerSqft
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.basePricePerSqft && (
                  <p className="text-red-500 text-sm mt-1">{errors.basePricePerSqft}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Floor-Rise Price (₹/floor)
                </label>
                <input
                  type="number"
                  name="floorRisePricePerFloor"
                  value={formData.floorRisePricePerFloor}
                  onChange={handleInputChange}
                  placeholder="e.g., 50000"
                  min="0"
                  step="1000"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.floorRisePricePerFloor
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.floorRisePricePerFloor && (
                  <p className="text-red-500 text-sm mt-1">{errors.floorRisePricePerFloor}</p>
                )}
              </div>
            </div>

            {/* Unit Type Pricing */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-900">Unit Type Pricing</label>
                <button
                  type="button"
                  onClick={addUnitTypePricing}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Unit Type
                </button>
              </div>

              <div className="space-y-3">
                {formData.unitTypePricing.map((pricing, idx) => (
                  <div key={idx} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Unit Type</label>
                      <select
                        value={pricing.type}
                        onChange={(e) => handleUnitTypePricingChange(idx, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select type</option>
                        {UNIT_TYPES.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors[`unitTypePricing_${idx}_type`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`unitTypePricing_${idx}_type`]}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹/sq ft)</label>
                      <input
                        type="number"
                        value={pricing.basePrice}
                        onChange={(e) => handleUnitTypePricingChange(idx, 'basePrice', e.target.value)}
                        placeholder="e.g., 5500"
                        min="0"
                        step="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors[`unitTypePricing_${idx}_basePrice`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`unitTypePricing_${idx}_basePrice`]}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Count</label>
                      <input
                        type="number"
                        value={pricing.units}
                        onChange={(e) => handleUnitTypePricingChange(idx, 'units', e.target.value)}
                        placeholder="e.g., 10"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors[`unitTypePricing_${idx}_units`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`unitTypePricing_${idx}_units`]}</p>
                      )}
                    </div>
                    {formData.unitTypePricing.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUnitTypePricing(idx)}
                        className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Block Offers */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  name="offersEnabled"
                  checked={formData.offersEnabled}
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
                <span className="font-medium text-gray-900">Block-Specific Offers</span>
              </label>

              {formData.offersEnabled && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Offer Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="offerDescription"
                    value={formData.offerDescription}
                    onChange={handleInputChange}
                    placeholder="e.g., 10% early bird discount for bookings in Q1 2024"
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                      errors.offerDescription
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {errors.offerDescription && (
                    <p className="text-red-500 text-sm mt-1">{errors.offerDescription}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Visibility & Access Control */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-4">
              <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-white rounded-lg transition">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path
                      fillRule="evenodd"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Show Block on Portal</p>
                    <p className="text-sm text-gray-600">Make this block visible to buyers</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="showOnPortal"
                  checked={formData.showOnPortal}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-white rounded-lg transition">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0015.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Allow Channel Partners</p>
                    <p className="text-sm text-gray-600">Enable sales through channel partners</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="allowChannelPartners"
                  checked={formData.allowChannelPartners}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-white rounded-lg transition">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2h8v-2zM2 8a2 2 0 11-4 0 2 2 0 014 0zM6 15a4 4 0 00-8 0v2h8v-2z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Allow Consultants</p>
                    <p className="text-sm text-gray-600">Allow consultants to recommend this block</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="allowConsultants"
                  checked={formData.allowConsultants}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-white rounded-lg transition">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Eligible for Boost Campaigns</p>
                    <p className="text-sm text-gray-600">Allow paid promotional campaigns</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="eligibleForBoostCampaigns"
                  checked={formData.eligibleForBoostCampaigns}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-3">Configuration Summary</p>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  <span className="font-medium">Block:</span> {formData.name} ({formData.code})
                </p>
                <p>
                  <span className="font-medium">Structure:</span> {formData.totalFloors} floors ×{' '}
                  {formData.unitsPerFloor} units = {totalUnits} total units
                </p>
                <p>
                  <span className="font-medium">Pricing:</span> ₹{formatPriceWithCommas(
                    String(formData.basePricePerSqft),
                  )}/sq ft{' '}
                  {formData.floorRisePricePerFloor
                    ? `+ ₹${formatPriceWithCommas(String(formData.floorRisePricePerFloor))}/floor`
                    : ''}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-3 text-gray-900 font-semibold hover:bg-white rounded-lg transition"
          >
            Cancel
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>

          {currentStep < ADD_BLOCK_STEPS.length ? (
            <button
              onClick={handleNextStep}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
            >
              Next
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold transition disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={handlePublish}
                disabled={isSaving}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition disabled:opacity-50"
              >
                {isSaving ? 'Publishing...' : 'Publish Block'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
