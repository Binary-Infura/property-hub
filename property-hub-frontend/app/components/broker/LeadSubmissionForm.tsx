'use client';

import { useState } from 'react';
import { Lead } from '@/app/types/lead';

interface LeadSubmissionFormProps {
  onSubmit: (lead: Omit<Lead, 'id' | 'createdAt' | 'qualityScore'>) => void;
}

export default function LeadSubmissionForm({ onSubmit }: LeadSubmissionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    city: '',
    budget: '',
    propertyType: '',
    buyerIntent: 'end-use' as const,
    source: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.location || !formData.budget) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit({
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      location: formData.location,
      city: formData.city,
      budget: formData.budget,
      propertyType: formData.propertyType,
      buyerIntent: formData.buyerIntent,
      source: formData.source || 'Direct Submission',
      status: 'new',
    });

    setSubmitted(true);
    setFormData({
      name: '',
      phone: '',
      email: '',
      location: '',
      city: '',
      budget: '',
      propertyType: '',
      buyerIntent: 'end-use',
      source: '',
    });

    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-2xl">
      {submitted && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Buyer lead submitted successfully!
          </p>
          <p className="text-green-700 text-sm mt-1">Your new buyer lead has been added to the system and will be reviewed by the team.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="space-y-6">
          {/* Name and Phone */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buyer Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name of buyer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10 digit mobile number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email and Location */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Area, City"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* City and Budget */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select city</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Delhi">Delhi</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget *
              </label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select budget range</option>
                <option value="₹20L - ₹30L">₹20L - ₹30L</option>
                <option value="₹30L - ₹50L">₹30L - ₹50L</option>
                <option value="₹50L - ₹75L">₹50L - ₹75L</option>
                <option value="₹75L - ₹1Cr">₹75L - ₹1Cr</option>
                <option value="₹1Cr+">₹1Cr+</option>
              </select>
            </div>
          </div>

          {/* Property Type and Intent */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select property type</option>
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buyer Intent
              </label>
              <select
                name="buyerIntent"
                value={formData.buyerIntent}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="end-use">End Use (Own)</option>
                <option value="investment">Investment</option>
              </select>
            </div>
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buyer Source
            </label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="e.g., Facebook, Referral, Website"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Submit Buyer Lead
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  name: '',
                  phone: '',
                  email: '',
                  location: '',
                  city: '',
                  budget: '',
                  propertyType: '',
                  buyerIntent: 'end-use',
                  source: '',
                })
              }
              className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-blue-900 text-sm">
            <strong>Note:</strong> Every buyer lead you submit will be verified and quality-checked by our team. Quality leads will earn you higher commissions!
          </p>
        </div>
      </form>
    </div>
  );
}
