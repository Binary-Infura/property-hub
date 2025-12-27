'use client';

import { useState, useEffect } from 'react';
import PropertyFilters from '@/app/components/PropertyFilters';
import PropertySearchCard from '@/app/components/PropertySearchCard';
import PropertyComparison from '@/app/components/PropertyComparison';

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
  id: number;
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
}

export default function PropertySearchPage() {
  const [filters, setFilters] = useState<FilterState>({
    location: '',
    propertyType: [],
    budgetMin: 0,
    budgetMax: 1000,
    bhk: [],
    propertyAge: 'Both',
    constructionStatus: 'Both',
  });

  const [shortlistedIds, setShortlistedIds] = useState<number[]>([]);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Sample properties data
  const [allProperties] = useState<Property[]>([
    {
      id: 1,
      title: 'Sunset Towers',
      config: '3 BHK',
      location: 'Bandra, Mumbai',
      area: '1800 sqft',
      price: '₹85L',
      propertyType: 'Flat',
      bhk: '3 BHK',
      isNew: false,
      isReadyToMove: true,
      highlights: ['Swimming Pool', 'Gym', 'Parking', 'Security'],
      amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Garden'],
      legalVerified: true,
      recommendationTag: 'Perfect Match',
      recommendationReason: 'Matches your budget perfectly with excellent location and amenities.',
    },
    {
      id: 2,
      title: 'Green Valley Homes',
      config: '2 BHK',
      location: 'Powai, Mumbai',
      area: '1200 sqft',
      price: '₹52L',
      propertyType: 'Flat',
      bhk: '2 BHK',
      isNew: true,
      isReadyToMove: false,
      highlights: ['Modern Design', 'Good Connectivity', 'Affordable'],
      amenities: ['Parking', 'Community Hall', 'Garden'],
      legalVerified: false,
      recommendationTag: 'Budget Friendly',
      recommendationReason: 'Great value for money in a developing area with good future prospects.',
    },
    {
      id: 3,
      title: 'Luxury Heights',
      config: '4 BHK',
      location: 'Worli, Mumbai',
      area: '2500 sqft',
      price: '₹1.2Cr',
      propertyType: 'Villa',
      bhk: '4 BHK',
      isNew: true,
      isReadyToMove: true,
      highlights: ['Premium Location', 'Luxury Amenities', 'High ROI'],
      amenities: ['Swimming Pool', 'Gym', 'Clubhouse', 'Security', 'Garden', 'Parking'],
      legalVerified: true,
      recommendationTag: 'Best Investment',
      recommendationReason: 'Premium property in prime location with excellent rental yield potential.',
    },
    {
      id: 4,
      title: 'City View Apartments',
      config: '1 BHK',
      location: 'Andheri, Mumbai',
      area: '650 sqft',
      price: '₹35L',
      propertyType: 'Flat',
      bhk: '1 BHK',
      isNew: false,
      isReadyToMove: true,
      highlights: ['Compact', 'Affordable', 'Good Location'],
      amenities: ['Parking', 'Security'],
      legalVerified: true,
    },
    {
      id: 5,
      title: 'Garden Estates',
      config: '3 BHK',
      location: 'Thane, Mumbai',
      area: '1600 sqft',
      price: '₹48L',
      propertyType: 'Villa',
      bhk: '3 BHK',
      isNew: true,
      isReadyToMove: false,
      highlights: ['Spacious', 'Green Surroundings', 'Family Friendly'],
      amenities: ['Garden', 'Parking', 'Security', 'Playground'],
      legalVerified: false,
    },
  ]);

  const [filteredProperties, setFilteredProperties] = useState<Property[]>(allProperties);

  // Filter properties based on filter state
  useEffect(() => {
    let filtered = [...allProperties];

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(p =>
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Property type filter
    if (filters.propertyType.length > 0) {
      filtered = filtered.filter(p =>
        filters.propertyType.includes(p.propertyType)
      );
    }

    // Budget filter
    filtered = filtered.filter(p => {
      const priceNum = parseInt(p.price.replace(/[₹L,]/g, ''));
      return priceNum >= filters.budgetMin && priceNum <= filters.budgetMax;
    });

    // BHK filter
    if (filters.bhk.length > 0) {
      filtered = filtered.filter(p =>
        filters.bhk.includes(p.bhk)
      );
    }

    // Property age filter
    if (filters.propertyAge !== 'Both') {
      filtered = filtered.filter(p =>
        filters.propertyAge === 'New' ? p.isNew : !p.isNew
      );
    }

    // Construction status filter
    if (filters.constructionStatus !== 'Both') {
      filtered = filtered.filter(p =>
        filters.constructionStatus === 'Ready' ? p.isReadyToMove : !p.isReadyToMove
      );
    }

    setFilteredProperties(filtered);
  }, [filters, allProperties]);

  const handleShortlist = (id: number) => {
    setShortlistedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    // Update journey step to "Shortlist" if first shortlist
    if (!shortlistedIds.includes(id) && shortlistedIds.length === 0) {
      // This would integrate with journey state management
      console.log('Journey moved to Shortlist step');
    }
  };

  const handleToggleCompare = (id: number) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleViewDetails = (id: number) => {
    // Navigate to property details page
    console.log('View details for property:', id);
  };

  const handleResetFilters = () => {
    setFilters({
      location: '',
      propertyType: [],
      budgetMin: 0,
      budgetMax: 1000,
      bhk: [],
      propertyAge: 'Both',
      constructionStatus: 'Both',
    });
  };

  const propertiesForComparison = allProperties.filter(p => compareIds.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Search Properties</h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredProperties.length} property{filteredProperties.length !== 1 ? 'ies' : ''} found
              </p>
            </div>
            <div className="flex gap-3">
              {compareIds.length > 0 && (
                <button
                  onClick={() => setShowComparison(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  Compare ({compareIds.length})
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition"
              >
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <PropertyFilters
              filters={filters}
              onFiltersChange={setFilters}
              onReset={handleResetFilters}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {filteredProperties.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters to see more results.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredProperties.map((property) => (
                  <PropertySearchCard
                    key={property.id}
                    property={property}
                    isShortlisted={shortlistedIds.includes(property.id)}
                    isSelectedForCompare={compareIds.includes(property.id)}
                    onShortlist={handleShortlist}
                    onViewDetails={handleViewDetails}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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

