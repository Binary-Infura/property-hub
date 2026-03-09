import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ConsultantData {
  name: string;
  role: string;
  rating: number;
  deals: number;
  initials: string;
}

interface PropertyData {
  id: string | number;
  config: string;
  location: string;
  area: string;
  age: string;
  price: string;
  budgetRange: string;
  bestFor: string;
  reason: string;
  highlights: string[];
  consultantNote: string;
  badge: string;
  badgeColor: string;
  consultant?: ConsultantData;
}

interface PropertyCardProps {
  property: PropertyData;
  isExpanded: boolean;
  onToggleExpand: (id: string | number) => void;
}

export default function PropertyCard({ property, isExpanded, onToggleExpand }: PropertyCardProps) {
  const { authenticated } = useAuth();
  return (
    <div
      onClick={() => onToggleExpand(property.id)}
      className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group text-left"
    >
      {/* Header with Badge */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-100">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{property.config}</h3>
            <p className="text-gray-600 text-sm mt-1">{property.location}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${property.badgeColor}`}>
            {property.badge}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Best For - Prominent Section */}
        <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Best For</p>
          <p className="text-gray-900 font-semibold text-lg leading-snug">
            {property.bestFor}
          </p>
        </div>

        {/* Why We Recommend */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Why We Recommend This</p>
          <p className="text-gray-700 leading-relaxed text-sm">
            {property.reason}
          </p>
        </div>

        {/* Budget & Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-5 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Budget Range</p>
            <p className="text-lg font-bold text-gray-900">{property.budgetRange}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Asking Price</p>
            <p className="text-lg font-bold text-blue-600">{property.price}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Area</p>
            <p className="text-sm font-semibold text-gray-900">{property.area}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Property Age</p>
            <p className="text-sm font-semibold text-gray-900">{property.age}</p>
          </div>
        </div>

        {/* Key Highlights */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Key Highlights</p>
          <div className="space-y-2">
            {property.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0"></div>
                <span className="text-gray-700 text-sm font-medium">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expandable Journey & Consultant Note */}
        {isExpanded && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Property Journey Stepper */}
            {authenticated && (
              <div className="p-8 bg-slate-900 rounded-[2rem] text-white shadow-2xl">
                <h4 className="text-sm font-black uppercase tracking-[0.3em] text-blue-400 mb-8 text-center">Your Property Journey</h4>
                <div className="flex justify-between items-start relative">
                  {/* Progress Bar Background */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-800 z-0 mx-6"></div>

                  {[
                    { label: 'Search', status: 'completed' },
                    { label: 'Shortlist', status: 'completed' },
                    { label: 'Loan', status: 'current', href: `/dashboard/loan?propertyId=${property.id}` },
                    { label: 'Docs', status: 'upcoming' },
                    { label: 'Legal', status: 'upcoming' },
                    { label: 'Booking', status: 'upcoming' },
                  ].map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-3 relative z-10 basis-0 grow">
                      {step.href ? (
                        <a
                          href={step.href}
                          onClick={(e) => e.stopPropagation()}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 hover:scale-125 ${step.status === 'completed' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : step.status === 'current' ? 'bg-white text-blue-600 shadow-xl' : 'bg-slate-800 text-slate-500 opacity-50'}`}
                        >
                          <span className="text-[10px] font-black">{step.status === 'completed' ? '✓' : idx + 1}</span>
                        </a>
                      ) : (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${step.status === 'completed' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : step.status === 'current' ? 'bg-white text-blue-600 shadow-xl scale-110' : 'bg-slate-800 text-slate-500 opacity-50'}`}>
                          <span className="text-[10px] font-black">{step.status === 'completed' ? '✓' : idx + 1}</span>
                        </div>
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${step.status === 'completed' ? 'text-blue-400' : step.status === 'current' ? 'text-white' : 'text-slate-600'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consultant Insight & Contact */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-8 bg-green-50/50 border border-green-100 rounded-[2rem]">
                <p className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Consultant Insight
                </p>
                <p className="text-slate-800 font-medium leading-relaxed italic">
                  "{property.consultantNote}"
                </p>
              </div>

              {property.consultant && (
                <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-[2rem]">
                  <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Managing Consultant
                  </p>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-200 uppercase">
                      {property.consultant.initials}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 leading-tight">{property.consultant.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        ★ {property.consultant.rating} • {property.consultant.deals}+ Deals
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-100 active:scale-95">
                      Call Now
                    </button>
                    <button className="flex-1 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition active:scale-95">
                      Schedule
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location Details Summary */}
        <div className="mb-5 p-4 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location
          </p>
          <p className="text-gray-900 font-medium text-sm">{property.location}</p>
          <p className="text-gray-600 text-xs mt-1">
            Click to see consultant's insights about this property
          </p>
        </div>

        {/* CTA Button */}
        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition shadow-sm hover:shadow-md">
          Schedule Site Visit
        </button>
      </div>

      {/* Footer Hint */}
      <div className="px-6 py-3 bg-gray-50 text-center border-t border-gray-100">
        <p className="text-xs text-gray-500">
          {isExpanded ? (
            <span className="flex items-center justify-center gap-1">
              <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Consultant note visible
            </span>
          ) : 'Click card to see consultant insight'}
        </p>
      </div>
    </div>
  );
}
