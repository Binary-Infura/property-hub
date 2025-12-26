'use client';

import { useState } from 'react';

export default function LeadCaptureForm() {
  const [formData, setFormData] = useState({
    phone: '',
    budget: '',
    location: '',
    intent: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ phone: '', budget: '', location: '', intent: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="lead-capture" className="py-16 md:py-24 bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Find Your Perfect Property
            </h2>
            <p className="text-lg text-gray-600">
              Answer a few quick questions and get expert guidance tailored to your needs
            </p>
          </div>

          {submitted && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium text-center">
                ✓ Thanks for reaching out! Our consultant will contact you shortly.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your 10-digit number"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Budget Range <span className="text-red-500">*</span>
              </label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Select your budget range</option>
                <option value="20-40">20L - 40L</option>
                <option value="40-60">40L - 60L</option>
                <option value="60-80">60L - 80L</option>
                <option value="80-1cr">80L - 1Cr</option>
                <option value="1cr-2cr">1Cr - 2Cr</option>
                <option value="2cr+">2Cr+</option>
              </select>
            </div>

            {/* Location Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Location Preference <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Andheri, Bandra, Powai, etc."
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Buying Intent */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Buying Intent <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                  <input
                    type="radio"
                    name="intent"
                    value="end-use"
                    checked={formData.intent === 'end-use'}
                    onChange={handleChange}
                    required
                    className="w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <span className="ml-3 font-medium text-gray-900">End-Use (Self)</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                  <input
                    type="radio"
                    name="intent"
                    value="investment"
                    checked={formData.intent === 'investment'}
                    onChange={handleChange}
                    required
                    className="w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <span className="ml-3 font-medium text-gray-900">Investment</span>
                </label>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg transition mt-8 shadow-md hover:shadow-lg"
            >
              Get Expert Property Advice
            </button>

            <p className="text-center text-gray-500 text-sm">
              Your information is secure. We respect your privacy.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
