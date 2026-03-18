'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PropertyFilters from '@/app/components/PropertyFilters';
import PropertySearchCard from '@/app/components/PropertySearchCard';
import PropertyComparison from '@/app/components/PropertyComparison';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { propertyService } from '@/app/services/propertyService';
import { userService } from '@/app/services/userService';

interface FilterState {
  location: string;
  propertyType: ('Flat' | 'Villa' | 'Plot' | 'Commercial')[];
  budgetMin: number;
  budgetMax: number;
  bhk: string[];
  propertyAge: 'New' | 'Resale' | 'Both';
  constructionStatus: 'Ready' | 'Under-Construction' | 'Both';
}

interface Property {
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
  amenities: string[];
  legalVerified: boolean;
  recommendationTag?: 'Perfect Match' | 'Budget Friendly' | 'Best Investment';
  recommendationReason?: string;
  image?: string;
  consultantNote?: string;
  consultant?: {
    name: string;
    initials: string;
    rating: number;
    deals: number;
    role: string;
  };
  partner?: {
    id: string;
    name: string;
  };
}

export default function PropertySearchPage({ hideHeader = false }: { hideHeader?: boolean }) {
  const router = useRouter();
  const { token, user } = useAuth();
  const { activeContext } = useUnifiedApp();
  const [loading, setLoading] = useState(true);
  const [allProperties, setAllProperties] = useState<Property[]>([]);

  const [filters, setFilters] = useState<FilterState>({
    location: '',
    propertyType: [],
    budgetMin: 0,
    budgetMax: 5000, // lac
    bhk: [],
    propertyAge: 'Both',
    constructionStatus: 'Both',
  });

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch real properties
  useEffect(() => {
    const fetchRealProperties = async () => {
      try {
        setLoading(true);
        const data = await propertyService.getAll(token || null, false, undefined, 'APPROVED');

        const mapped: Property[] = data.map(p => ({
          id: p.id,
          title: p.name,
          config: `${p.bedrooms || 2} BHK`,
          location: p.location,
          area: `${p.area || 1200} sqft`,
          price: `₹${(Number(p.price) / 100000).toFixed(1)}L`,
          propertyType: (p.propertyType === 'APARTMENT' ? 'Flat' :
            p.propertyType === 'VILLA' ? 'Villa' :
              p.propertyType === 'PLOT' ? 'Plot' : 'Commercial') as any,
          bhk: `${p.bedrooms || 2} BHK`,
          isNew: true,
          isReadyToMove: p.status === 'DRAFT' || p.status === 'APPROVED',
          highlights: ['Legal Verified', 'Premium Location', 'High ROI'],
          amenities: ['Parking', 'Security', 'Water Supply'],
          legalVerified: p.status === 'APPROVED',
          image: undefined,
          consultantNote: "This property offers exceptional value in a high-growth corridor. Ideal for long-term appreciation.",
          consultant: {
            name: "Rajesh Sharma",
            initials: "RS",
            rating: 4.8,
            deals: 35,
            role: "Senior Consultant"
          },
          partner: p.onboardedBy && p.onboardedById ? {
            id: p.onboardedById,
            name: `${p.onboardedBy.firstName || ''} ${p.onboardedBy.lastName || ''}`.trim() || p.onboardedBy.name || 'Partner'
          } : undefined
        }));

        setAllProperties(mapped);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealProperties();
  }, [token]);

  // Fetch buyer profile for initial filters
  useEffect(() => {
    const fetchBuyerProfile = async () => {
      if (token && user?.userId && activeContext.activeRole.id === 'BUYER') {
        try {
          const profileStatus = await userService.getById(user.userId, token);
          if (profileStatus && profileStatus.buyerProfile) {
            const bp = profileStatus.buyerProfile;
            setFilters(prev => ({
              ...prev,
              location: bp.preferredLocations && bp.preferredLocations.length > 0 ? bp.preferredLocations[0] : prev.location,
              budgetMin: bp.budgetMin ? Number(bp.budgetMin) / 100000 : prev.budgetMin,
              budgetMax: bp.budgetMax ? Number(bp.budgetMax) / 100000 : prev.budgetMax,
            }));
          }
        } catch (error) {
          console.error('Failed to fetch buyer profile:', error);
        }
      }
    };

    fetchBuyerProfile();
  }, [token, user?.userId, activeContext.activeRole.id]);

  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

  useEffect(() => {
    let filtered = [...allProperties];

    if (filters.location) {
      filtered = filtered.filter(p =>
        p.location.toLowerCase().includes(filters.location.toLowerCase()) ||
        p.title.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.propertyType.length > 0) {
      filtered = filtered.filter(p =>
        filters.propertyType.includes(p.propertyType)
      );
    }

    filtered = filtered.filter(p => {
      const priceNum = parseFloat(p.price.replace(/[₹L,]/g, ''));
      return priceNum >= filters.budgetMin && priceNum <= filters.budgetMax;
    });

    if (filters.bhk.length > 0) {
      filtered = filtered.filter(p =>
        filters.bhk.includes(p.bhk)
      );
    }

    if (filters.propertyAge !== 'Both') {
      filtered = filtered.filter(p =>
        filters.propertyAge === 'New' ? p.isNew : !p.isNew
      );
    }

    if (filters.constructionStatus !== 'Both') {
      filtered = filtered.filter(p =>
        filters.constructionStatus === 'Ready' ? p.isReadyToMove : !p.isReadyToMove
      );
    }

    setFilteredProperties(filtered);
  }, [filters, allProperties]);

  const handleToggleCompare = (id: string) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleViewDetails = (id: string) => {
    router.push(`/search/${id}`);
  };

  const handleResetFilters = () => {
    setFilters({
      location: '',
      propertyType: [],
      budgetMin: 0,
      budgetMax: 5000,
      bhk: [],
      propertyAge: 'Both',
      constructionStatus: 'Both',
    });
  };

  const propertiesForComparison = allProperties.filter(p => compareIds.includes(p.id));

  return (
    <div className={`bg-[#FDFDFF] ${hideHeader ? '' : 'min-h-screen'}`}>
      {/* Premium Search Header */}
      {!hideHeader && (
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Discovery</h1>
                </div>
                <p className="text-sm font-bold text-slate-400 ml-1">
                  Showing <span className="text-blue-600">{filteredProperties.length}</span> curated {filteredProperties.length === 1 ? 'residence' : 'residences'}
                  {filters.location && (
                    <> in <span className="text-slate-900">{filters.location}</span></>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                {compareIds.length > 0 && (
                  <button
                    onClick={() => setShowComparison(true)}
                    className="px-6 py-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-blue-100 flex items-center gap-3 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    Compare Portfolio ({compareIds.length})
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden w-full px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl"
                >
                  Toggle Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${hideHeader ? 'py-0' : 'py-12'}`}>
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Filters Sidebar */}
          <aside className={`lg:col-span-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <PropertyFilters
              filters={filters}
              onFiltersChange={setFilters}
              onReset={handleResetFilters}
            />
          </aside>

          {/* Results Grid */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border border-slate-50 shadow-2xl shadow-slate-100">
                <div className="relative mb-8">
                  <div className="w-20 h-20 border-4 border-blue-50 rounded-full"></div>
                  <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="text-slate-400 font-black uppercase text-xs tracking-[0.4em] animate-pulse">Syncing Inventory...</p>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-100 border border-slate-50 p-24 text-center">
                <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                  <svg
                    className="w-16 h-16 text-slate-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">No Properties Matched</h3>
                <p className="text-slate-400 font-bold mb-12 max-w-sm mx-auto text-lg leading-relaxed">
                  We couldn't find any premium properties matching your selection.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 active:scale-95"
                >
                  Reset Parameters
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="hover:scale-[1.01] transition-transform duration-500">
                    <PropertySearchCard
                      property={property}
                      isSelectedForCompare={compareIds.includes(property.id)}
                      onViewDetails={handleViewDetails}
                      onToggleCompare={handleToggleCompare}
                    />
                  </div>
                ))}

                {/* Premium Footer Hint */}
                <div className="py-20 text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">End of Collection • Premium Plus Exclusive</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Comparison Modal */}
      {showComparison && (
        <PropertyComparison
          properties={propertiesForComparison}
          onClose={() => setShowComparison(false)}
          onRemove={(id) => setCompareIds(prev => prev.filter(i => i !== id))}
        />
      )}
    </div>
  );
}
