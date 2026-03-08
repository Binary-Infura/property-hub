import { useState } from 'react';

interface ConsultantData {
  name: string;
  role: string;
  rating: number;
  deals: number;
  initials: string;
}

interface PropertyData {
  id: number;
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
  onToggleExpand: (id: number) => void;
}

export default function PropertyCard({ property, isExpanded, onToggleExpand }: PropertyCardProps) {
  return (
    <div
      onClick={() => onToggleExpand(property.id)}
      className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group"
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
            <div className="p-8 bg-slate-900 rounded-[2rem] text-white shadow-2xl">
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-blue-400 mb-8 text-center">Your Property Journey</h4>
              <div className="flex justify-between items-start relative">
                {/* Progress Bar Background */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-800 z-0 mx-6"></div>

                {[
                  { label: 'Search', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>, status: 'completed' },
                  { label: 'Shortlist', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.040.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>, status: 'completed' },
                  { label: 'Loan', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>, status: 'current', href: `/dashboard/loan?propertyId=${property.id}` },
                  { label: 'Docs', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>, status: 'upcoming' },
                  { label: 'Legal', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 5.49Z" /></svg>, status: 'upcoming' },
                  { label: 'Booking', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>, status: 'upcoming' },
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-3 relative z-10 basis-0 grow">
                    {step.href ? (
                      <a
                        href={step.href}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 hover:scale-125 ${step.status === 'completed' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : step.status === 'current' ? 'bg-white text-blue-600 shadow-xl' : 'bg-slate-800 text-slate-500 opacity-50'}`}
                        title={`Manage ${step.label}`}
                      >
                        {step.icon}
                      </a>
                    ) : (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${step.status === 'completed' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : step.status === 'current' ? 'bg-white text-blue-600 shadow-xl scale-110' : 'bg-slate-800 text-slate-500 opacity-50'}`}>
                        {step.icon}
                      </div>
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${step.status === 'completed' ? 'text-blue-400' : step.status === 'current' ? 'text-white' : 'text-slate-600'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

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
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-200">
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
