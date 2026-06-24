'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ConsultationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: '',
    budget: '',
    location: '',
    intent: '',
    firstName: '',
    lastName: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.budget) {
      newErrors.budget = 'Budget range is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location preference is required';
    }

    if (!formData.intent) {
      newErrors.intent = 'Please select your buying intent';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102'}/api/public/buyers/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Signup failed');
      }

      // Login the user automatically or redirect to login?
      // Since we don't return a token on signup (usually), we redirect to login or dashboard if we implement auto-login
      // For now, redirect to login with a message? Or just signin page.
      // Or we can try to login immediately if we knew the password, but we generated a temp one.

      // Let's redirect to signin for now
      router.push('/signin?registered=true');
    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors({ submit: error.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:text-blue-600">
              <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
              BuilderBus
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Form Section */}
      <section className="py-12 md:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Free Consultation & Sign Up
              </h1>
              <p className="text-lg text-gray-600">
                Create your account and get expert guidance tailored to your needs
              </p>
            </div>

            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium text-center">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.firstName ? 'border-red-300' : 'border-gray-300'
                      }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.lastName ? 'border-red-300' : 'border-gray-300'
                      }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

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
                  maxLength={10}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
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
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${errors.budget ? 'border-red-300' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select your budget range</option>
                  <option value="20-40">₹20L - ₹40L</option>
                  <option value="40-60">₹40L - ₹60L</option>
                  <option value="60-80">₹60L - ₹80L</option>
                  <option value="80-1cr">₹80L - ₹1Cr</option>
                  <option value="1cr-2cr">₹1Cr - ₹2Cr</option>
                  <option value="2cr+">₹2Cr+</option>
                </select>
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                )}
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
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.location ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              {/* Buying Intent */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Buying Intent <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${formData.intent === 'end-use'
                    ? 'border-blue-600 bg-blue-50'
                    : errors.intent
                      ? 'border-red-300 hover:bg-red-50'
                      : 'border-gray-300 hover:bg-blue-50'
                    }`}>
                    <input
                      type="radio"
                      name="intent"
                      value="end-use"
                      checked={formData.intent === 'end-use'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <span className="ml-3 font-medium text-gray-900">End-Use (Self)</span>
                  </label>
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${formData.intent === 'investment'
                    ? 'border-blue-600 bg-blue-50'
                    : errors.intent
                      ? 'border-red-300 hover:bg-red-50'
                      : 'border-gray-300 hover:bg-blue-50'
                    }`}>
                    <input
                      type="radio"
                      name="intent"
                      value="investment"
                      checked={formData.intent === 'investment'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <span className="ml-3 font-medium text-gray-900">Investment</span>
                  </label>
                </div>
                {errors.intent && (
                  <p className="mt-1 text-sm text-red-600">{errors.intent}</p>
                )}
              </div>

              {/* CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg transition mt-8 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : 'Sign Up & Get Expert Property Advice'}
              </button>

              <p className="text-center text-gray-500 text-sm">
                Your information is secure. We respect your privacy.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

