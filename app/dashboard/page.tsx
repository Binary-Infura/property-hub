'use client';

import { useState } from 'react';
import PropertyCard from '@/app/components/PropertyCard';

/**
 * Buyer Dashboard (End User)
 * 
 * This is the canonical dashboard route for buyers: /dashboard
 * Reserved exclusively for Buyer role - shortest and cleanest URL.
 */

interface ShortlistedProperty {
  id: number;
  title: string;
  location: string;
  price: string;
  config: string;
  status: 'viewed' | 'site-visit-scheduled' | 'under-consideration';
}

interface Document {
  id: string;
  name: string;
  category: 'identity' | 'income' | 'property' | 'legal';
  status: 'required' | 'uploaded' | 'verified';
  uploadedDate?: string;
}

export default function BuyerDashboard() {
  const [expandedProperty, setExpandedProperty] = useState<number | null>(null);
  const [activeJourneyStep, setActiveJourneyStep] = useState<number>(2); // Property Search = 0, Shortlist = 1, Loan = 2, etc.

  // Property Journey Steps
  const journeySteps = [
    { id: 0, label: 'Property Search', svgIcon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg> },
    { id: 1, label: 'Shortlist', svgIcon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.040.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg> },
    { id: 2, label: 'Loan', svgIcon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg> },
    { id: 3, label: 'Documents', svgIcon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg> },
    { id: 4, label: 'Legal', svgIcon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97Z" /></svg> },
    { id: 5, label: 'Booking', svgIcon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> },
  ];

  // Property Recommendations
  const recommendedProperties = [
    {
      id: 1,
      price: "₹45L",
      config: "3 BHK",
      location: "Andheri, Mumbai",
      area: "1500 sqft",
      age: "5-year old",
      badge: "Perfect Match",
      badgeColor: "bg-green-100 text-green-700",
      bestFor: "Growing families seeking top schools and community",
      budgetRange: "₹40L - ₹60L",
      reason: "Matches your budget with excellent school connectivity for families. High appreciation potential in this locality.",
      highlights: ["Family-friendly location", "Top-rated schools nearby", "Good resale value", "Modern amenities"],
      consultantNote: "This property checks all your boxes—budget, location, and family needs. The area has strong appreciation with excellent community infrastructure."
    },
    {
      id: 2,
      price: "₹52L",
      config: "2 BHK",
      location: "Bandra, Mumbai",
      area: "1200 sqft",
      age: "3-year old",
      badge: "High Demand",
      badgeColor: "bg-blue-100 text-blue-700",
      bestFor: "Investors looking for premium rental yields",
      budgetRange: "₹50L - ₹60L",
      reason: "Premium location with strong investment potential. Delivers 4.5% annual rental yield with capital appreciation.",
      highlights: ["4.5% annual rental yield", "Prime investment location", "High demand area", "Strong appreciation"],
      consultantNote: "As an investment property, this shows strong growth trajectory in an upmarket area. Excellent for long-term wealth creation."
    },
  ];

  // Shortlisted Properties
  const shortlistedProperties: ShortlistedProperty[] = [
    {
      id: 1,
      title: "Sunset Towers, Bandra",
      location: "Bandra, Mumbai",
      price: "₹85L",
      config: "3 BHK",
      status: 'site-visit-scheduled'
    },
    {
      id: 2,
      title: "Green Valley Homes, Powai",
      location: "Powai, Mumbai",
      price: "₹52L",
      config: "2 BHK",
      status: 'under-consideration'
    },
  ];

  // Documents
  const documents: Document[] = [
    { id: '1', name: 'Aadhaar Card', category: 'identity', status: 'verified', uploadedDate: '2024-01-15' },
    { id: '2', name: 'PAN Card', category: 'identity', status: 'verified', uploadedDate: '2024-01-15' },
    { id: '3', name: 'Salary Slips (Last 3 months)', category: 'income', status: 'uploaded', uploadedDate: '2024-01-20' },
    { id: '4', name: 'Bank Statements (Last 6 months)', category: 'income', status: 'uploaded', uploadedDate: '2024-01-20' },
    { id: '5', name: 'Property Documents', category: 'property', status: 'required' },
    { id: '6', name: 'Legal Verification Report', category: 'legal', status: 'required' },
  ];

  const uploadedCount = documents.filter(d => d.status === 'uploaded' || d.status === 'verified').length;
  const requiredCount = documents.filter(d => d.status === 'required').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Property Journey Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Your Property Journey</h2>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
            <div
              className="h-1 bg-blue-600 transition-all duration-300"
              style={{ width: `${(activeJourneyStep / (journeySteps.length - 1)) * 100}%` }}
            ></div>
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {journeySteps.map((step, index) => {
              const isActive = index <= activeJourneyStep;
              const isCurrent = index === activeJourneyStep;

              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${isActive
                      ? 'bg-blue-600 text-white shadow-lg scale-110'
                      : 'bg-gray-200 text-gray-500'
                      }`}
                  >
                    {step.svgIcon}
                  </div>
                  <p className={`mt-3 text-sm font-medium text-center ${isCurrent ? 'text-blue-600' : isActive ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <span className="mt-1 text-xs text-blue-600 font-semibold">Current Step</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* 2. Property Recommendations */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recommended Properties</h2>
              <div className="flex gap-3">
                <a
                  href="/search"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Search Properties →
                </a>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  View All →
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {recommendedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isExpanded={expandedProperty === property.id}
                  onToggleExpand={(id) => setExpandedProperty(id === expandedProperty ? null : id)}
                />
              ))}
            </div>
          </div>

          {/* 3. Shortlisted Properties */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Shortlisted Properties</h2>
              <span className="text-sm text-gray-600">{shortlistedProperties.length} saved</span>
            </div>
            <div className="space-y-4">
              {shortlistedProperties.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{property.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{property.location} • {property.config}</p>
                    <p className="text-lg font-bold text-blue-600 mt-2">{property.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${property.status === 'site-visit-scheduled'
                      ? 'bg-green-100 text-green-700'
                      : property.status === 'under-consideration'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                      {property.status === 'site-visit-scheduled' ? 'Visit Scheduled' : 'Under Review'}
                    </span>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {shortlistedProperties.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No shortlisted properties yet. Start exploring recommendations above!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* 4. Loan Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Loan Status</h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Eligible Amount</p>
                <p className="text-2xl font-bold text-green-700">₹65L</p>
                <p className="text-xs text-green-600 mt-1">Based on your income profile</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Application Status</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">In Progress</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-gray-500">60% complete • Documents under review</p>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition">
                Track Application
              </button>
            </div>
          </div>

          {/* 5. Document Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Documents</h2>
              <span className="text-xs text-gray-600">{uploadedCount}/{documents.length} uploaded</span>
            </div>
            <div className="space-y-3 mb-4">
              {documents.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${doc.status === 'verified'
                      ? 'bg-green-100 text-green-600'
                      : doc.status === 'uploaded'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                      }`}>
                      {doc.status === 'verified' ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : doc.status === 'uploaded' ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      {doc.uploadedDate && (
                        <p className="text-xs text-gray-500">{doc.uploadedDate}</p>
                      )}
                    </div>
                  </div>
                  {doc.status === 'required' && (
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      Upload
                    </button>
                  )}
                </div>
              ))}
            </div>
            {requiredCount > 0 && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs font-medium text-amber-800">
                  {requiredCount} document{requiredCount > 1 ? 's' : ''} pending upload
                </p>
              </div>
            )}
            <button className="w-full mt-4 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm transition">
              Manage Documents
            </button>
          </div>

          {/* 6. Legal Verification */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Legal Verification</h2>
            <div className="space-y-4">
              {shortlistedProperties.length > 0 ? (
                <>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">Sunset Towers, Bandra</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Verified
                      </span>
                      <span className="text-xs text-gray-600">Report available</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      All legal documents verified. Property is clear for purchase.
                    </p>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition">
                      View Report
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No property selected for legal verification</p>
                  <p className="text-xs mt-2">Select a property to view legal status</p>
                </div>
              )}
            </div>
          </div>

          {/* 7. Consultant Support */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Consultant</h2>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                RS
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Rajesh Sharma</h3>
                <p className="text-sm text-gray-600">Senior Property Consultant</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs text-gray-500 font-medium">4.9 rating</span>
                  </div>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">50+ deals closed</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Consultant
              </button>
              <button className="w-full px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm transition flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Request Site Visit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
