'use client';

import { useState } from 'react';
import { useConsultingBucket } from '../contexts/ConsultingBucketContext';
import { useUnifiedApp } from '../contexts/UnifiedAppContext';
import { useAuth } from '../contexts/AuthContext';

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
  consultantNote?: string;
  consultant?: {
    name: string;
    role: string;
    rating: number;
    deals: number;
    initials: string;
  };
  partner?: {
    id: string;
    name: string;
  };
}
interface PropertySearchCardProps {
  property: PropertySearchCardData;
  isSelectedForCompare: boolean;
  onViewDetails: (id: string) => void;
  onToggleCompare: (id: string) => void;
}

export default function PropertySearchCard({
  property,
  isSelectedForCompare,
  onViewDetails,
  onToggleCompare,
}: PropertySearchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { addItem, removeItem, isInBucket } = useConsultingBucket();
  const { activeContext } = useUnifiedApp();
  const { authenticated } = useAuth();
  const alreadyInBucket = isInBucket(property.id);
  const isBuyer = (activeContext.activeRole.id === 'BUYER') && authenticated;

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
      onClick={() => setIsExpanded(!isExpanded)}
      className={`group bg-white rounded-[2.5rem] overflow-hidden transition-all duration-500 border-2 cursor-pointer ${isSelectedForCompare ? 'border-blue-500 shadow-2xl ring-4 ring-blue-50' : 'border-slate-100 hover:border-blue-200 shadow-xl shadow-slate-200/50'
        }`}
    >
      {/* Image Section */}
      <div className="relative h-72 bg-slate-100 overflow-hidden">
        {property.image ? (
          <img src={property.image} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <svg className="w-20 h-20 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

        {/* Badges Overlay */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          {property.recommendationTag && (
            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border border-white/20 ${property.recommendationTag === 'Perfect Match' ? 'bg-emerald-500 text-white' :
              property.recommendationTag === 'Budget Friendly' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
              }`}>
              {property.recommendationTag}
            </span>
          )}
          {property.legalVerified && (
            <span className="px-4 py-2 bg-white/95 backdrop-blur-md text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 border border-slate-200/50">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Title Verified
            </span>
          )}
        </div>

        {/* Action Overlays */}
        <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
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
        </div>

        {/* Price/Location Overlay (Bottom) */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Premier Listing</p>
              <h3 className="text-2xl font-black text-white tracking-tight leading-none truncate max-w-[200px]">{property.title}</h3>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-white tracking-tighter shadow-sm">{property.price}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8">
        {/* Basic Info Chips */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[11px] font-black text-slate-600 border border-slate-100 uppercase tracking-widest">
            {property.config}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[11px] font-black text-slate-600 border border-slate-100 uppercase tracking-widest">
            {property.area}
          </div>
          <div className="ml-auto flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {property.location}
          </div>
        </div>

        {/* Expandable Section */}
        {isExpanded && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 mb-8 pt-4 border-t border-slate-50">

            {/* Consultant & Insight */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Consultant Insight</p>
                <p className="text-slate-700 font-medium leading-relaxed italic">"{property.consultantNote || "Exceptional property with high potential for appreciation."}"</p>
              </div>

              {property.consultant && (
                <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100">
                  <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-4">Managing Consultant</p>
                  <div className="flex items-center gap-4">
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
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(property.id);
            }}
            className="flex-1 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs tracking-widest uppercase hover:bg-slate-800 transition active:scale-95 shadow-xl"
          >
            Property Details
          </button>

          {isBuyer && (
            <button
              onClick={handleBucketAction}
              className={`flex-1 py-4 border-2 rounded-[1.5rem] font-black text-xs tracking-widest uppercase transition-all active:scale-95 ${alreadyInBucket ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                }`}
            >
              {alreadyInBucket ? 'Remove' : 'Save Match'}
            </button>
          )}
        </div>

        {/* Footer Hint */}
        <p className="text-[10px] font-black text-slate-400 text-center uppercase tracking-[0.2em] mt-6">
          {isExpanded ? 'Click to collapse insights' : 'Click card for consultant insights'}
        </p>
      </div>
    </div>
  );
}
