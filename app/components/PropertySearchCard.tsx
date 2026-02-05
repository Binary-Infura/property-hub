'use client';

interface PropertySearchCardData {
  id: string;
  title: string;
  config: string;
  location: string;
  area: string;
  price: string;
  propertyType: 'Flat' | 'Villa' | 'Plot' | 'Commercial';
  bhk: string;
  isNew: boolean;
  isReadyToMove: boolean;
  highlights: string[];
  legalVerified: boolean;
  recommendationTag?: 'Perfect Match' | 'Budget Friendly' | 'Best Investment';
  recommendationReason?: string;
  image?: string;
}

interface PropertySearchCardProps {
  property: PropertySearchCardData;
  isShortlisted: boolean;
  isSelectedForCompare: boolean;
  onShortlist: (id: string) => void;
  onViewDetails: (id: string) => void;
  onToggleCompare: (id: string) => void;
}

export default function PropertySearchCard({
  property,
  isShortlisted,
  isSelectedForCompare,
  onShortlist,
  onViewDetails,
  onToggleCompare,
}: PropertySearchCardProps) {
  return (
    <div className={`group bg-white rounded-[2.5rem] overflow-hidden transition-all duration-500 border-2 active:scale-[0.98] ${isSelectedForCompare ? 'border-blue-500 shadow-2xl ring-4 ring-blue-50' : 'border-slate-100 hover:border-blue-200 shadow-xl shadow-slate-200/50'
      }`}>
      {/* Image Section */}
      <div className="relative h-64 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onViewDetails(property.id)}>
        {property.image ? (
          <img src={property.image} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <svg className="w-20 h-20 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

        {/* Badges Overlay */}
        <div className="absolute top-5 left-5 flex flex-col gap-2">
          {property.recommendationTag && (
            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border border-white/20 ${property.recommendationTag === 'Perfect Match'
              ? 'bg-emerald-500/90 text-white'
              : property.recommendationTag === 'Budget Friendly'
                ? 'bg-amber-500/90 text-white'
                : 'bg-blue-600/90 text-white'
              }`}>
              {property.recommendationTag}
            </span>
          )}
          {property.legalVerified && (
            <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 border border-slate-200/50">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Legal Verified
            </span>
          )}
        </div>

        {/* Action Overlays */}
        <div className="absolute top-5 right-5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(property.id);
            }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-white shadow-xl hover:scale-110 active:scale-95 ${isSelectedForCompare ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}
          >
            <svg className="w-6 h-6" fill={isSelectedForCompare ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShortlist(property.id);
            }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-white shadow-xl hover:scale-110 active:scale-95 ${isShortlisted ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
          >
            <svg className="w-6 h-6" fill={isShortlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">{property.title}</h3>
            <div className="flex items-center gap-2 text-slate-400 font-bold group-hover:translate-x-1 transition-transform">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {property.location}
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-blue-600 tracking-tighter">{property.price}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Starting From</p>
          </div>
        </div>

        {/* Stats Chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { val: property.config, icon: '🛏️' },
            { val: property.area, icon: '📐' },
            { val: property.propertyType, icon: '🏠' },
            { val: property.isReadyToMove ? 'Ready' : 'Under Const', icon: '🏗️' }
          ].map((chip, i) => (
            <div key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-2 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
              <span className="text-sm">{chip.icon}</span>
              <span className="text-[11px] font-extrabold text-slate-600 group-hover:text-blue-700">{chip.val}</span>
            </div>
          ))}
        </div>

        {/* Multi-Action Area */}
        <div className="flex items-center gap-4 border-t border-slate-50 pt-8 mt-auto">
          <button
            onClick={() => onViewDetails(property.id)}
            className="flex-1 py-4 bg-slate-900 border-2 border-slate-900 text-white rounded-[1.5rem] font-black text-sm tracking-widest uppercase hover:bg-blue-600 hover:border-blue-600 hover:-translate-y-1 transition-all active:scale-95 shadow-2xl"
          >
            View Experience
          </button>
        </div>
      </div>
    </div>
  );
}

