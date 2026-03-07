'use client';

import { useConsultingBucket } from '../contexts/ConsultingBucketContext';
import { useUnifiedApp } from '../contexts/UnifiedAppContext';

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
  partner?: {
    id: string;
    name: string;
  };
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
  const { addItem, removeItem, isInBucket } = useConsultingBucket();
  const { activeContext } = useUnifiedApp();
  const alreadyInBucket = isInBucket(property.id);
  const isBuyer = activeContext.activeRole.id === 'buyer';

  const handleBucketAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (alreadyInBucket) {
      removeItem(property.id);
    } else {
      addItem({
        id: property.id,
        title: property.title,
        price: property.price,
        location: property.location
      });
    }
  };

  return (
    <div
      onClick={() => onViewDetails(property.id)}
      className={`group bg-white rounded-[2.5rem] overflow-hidden transition-all duration-500 border-2 active:scale-[0.98] cursor-pointer ${isSelectedForCompare ? 'border-blue-500 shadow-2xl ring-4 ring-blue-50' : 'border-slate-100 hover:border-blue-200 shadow-xl shadow-slate-200/50'
        }`}>
      {/* Image Section */}
      <div className="relative h-64 bg-slate-100 overflow-hidden">
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
            { val: property.config, svgIcon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg> },
            { val: property.area, svgIcon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg> },
            { val: property.propertyType, svgIcon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
            { val: property.isReadyToMove ? 'Ready' : 'Under Const', svgIcon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.654m5.58-2.769 1.322-1.219c.38-.36.594-.85.594-1.362V3.75a.75.75 0 0 0-.75-.75h-5.25c-.512 0-1.001.213-1.362.594L8.5 5.25" /></svg> }
          ].map((chip, i) => (
            <div key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-2 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
              <span className="text-slate-400">{chip.svgIcon}</span>
              <span className="text-[11px] font-extrabold text-slate-600 group-hover:text-blue-700">{chip.val}</span>
            </div>
          ))}
        </div>

        {property.partner && (
          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-colors" onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/partner/${property.partner?.id}`;
          }}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg">
              {property.partner.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Listed By Partner</p>
              <p className="text-sm font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{property.partner.name}</p>
            </div>
            <div className="text-slate-400 group-hover:text-indigo-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Multi-Action Area */}
        <div className="flex items-center gap-4 border-t border-slate-50 pt-8 mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(property.id);
            }}
            className="flex-1 py-4 bg-slate-900 border-2 border-slate-900 text-white rounded-[1.5rem] font-black text-sm tracking-widest uppercase hover:bg-white hover:text-slate-900 hover:-translate-y-1 transition-all active:scale-95 shadow-2xl"
          >
            Explore
          </button>
          {isBuyer && (
            <button
              onClick={handleBucketAction}
              className={`flex-1 py-4 border-2 rounded-[1.5rem] font-black text-sm tracking-widest uppercase transition-all active:scale-95 shadow-2xl hover:-translate-y-1 ${alreadyInBucket
                ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100 hover:border-rose-200'
                : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700'
                }`}
            >
              {alreadyInBucket ? 'Remove' : 'Save Property'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

