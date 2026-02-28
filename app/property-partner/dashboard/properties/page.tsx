'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Property, PropertyStatus, PropertyCategory } from '@/app/types/property';
import { PROPERTY_STATUS_CONFIG, PROPERTY_TYPES } from '@/app/constants/property';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import AddPropertyModal from '@/app/components/property-partner/AddPropertyModal';
import SelectPropertyModal from '@/app/components/property-partner/SelectPropertyModal';
import ViewListingModal from '@/app/components/property-partner/ViewListingModal';
import ImportReraPropertyModal from '@/app/components/property-partner/ImportReraPropertyModal';
import MarkAsSoldModal from '@/app/components/property-partner/MarkAsSoldModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type FilterStatus = PropertyStatus | 'all';

const CATEGORY_CONFIG: Record<PropertyCategory, { label: string; color: string; bgColor: string }> = {
  flat: { label: 'Flat', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  plot: { label: 'Plot', color: 'text-green-700', bgColor: 'bg-green-100' },
  shop: { label: 'Shop', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  villa: { label: 'Villa', color: 'text-pink-700', bgColor: 'bg-pink-100' },
  office: { label: 'Office', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  warehouse: { label: 'Warehouse', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

export default function PropertiesPage() {
  const { token } = useAuth();
  const { activeContext } = useUnifiedApp();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isViewListingModalOpen, setIsViewListingModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMarkAsSoldModalOpen, setIsMarkAsSoldModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPropertyForView, setSelectedPropertyForView] = useState<Property | null>(null);
  const [selectedPropertyForSale, setSelectedPropertyForSale] = useState<Property | null>(null);

  const fetchProperties = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/properties/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        const mapped: Property[] = data.map((p: any) => {
          const backendStatus = p.status?.toUpperCase();
          let frontendStatus: PropertyStatus = 'available';

          switch (backendStatus) {
            case 'AVAILABLE': frontendStatus = 'available'; break;
            case 'SUBMITTED': frontendStatus = 'submitted'; break;
            case 'APPROVED': frontendStatus = 'approved'; break;
            case 'REJECTED': frontendStatus = 'rejected'; break;
            case 'PUBLISHED': frontendStatus = 'published'; break;
            case 'DRAFT': frontendStatus = 'draft'; break;
            default: frontendStatus = p.status?.toLowerCase() as PropertyStatus;
          }

          let description = p.description || '';
          let amenities: string[] = [];
          if (description.includes('Amenities:')) {
            const parts = description.split('Amenities:');
            description = parts[0].trim();
            amenities = parts[1].split(',').map((a: string) => a.trim());
          }

          return {
            id: p.id,
            title: p.name,
            propertyType: p.propertyType === 'COMMERCIAL' ? 'commercial' : 'residential',
            propertyCategory: p.category?.toLowerCase() as any,
            location: p.location,
            address: p.address || '',
            city: p.locationRel?.city || p.city || '',
            state: p.locationRel?.state || '',
            pincode: p.pincode || '',
            totalArea: parseFloat(p.area) || 0,
            totalBuildings: 0,
            totalUnits: 0,
            startingPrice: parseFloat(p.price) || 0,
            description: description,
            amenities: amenities,
            status: frontendStatus,
            createdAt: new Date(p.createdAt),
            videoUrl: p.videoUrl || '',
            continent: p.locationRel?.continent || p.continent || '',
            country: p.locationRel?.country || p.country || '',
            buyerName: p.buyerName,
            buyerPhone: p.buyerPhone,
            salePrice: parseFloat(p.salePrice) || 0,
            soldAt: p.soldAt ? new Date(p.soldAt) : undefined,
          };
        });

        setProperties(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [token]);

  const handleAddProperty = () => {
    setEditingId(null);
    setIsAddModalOpen(true);
  };

  const handleEditProperty = (id: string) => {
    setEditingId(id);
    setIsAddModalOpen(true);
  };

  const handleViewListingData = (property: Property) => {
    setSelectedPropertyForView(property);
    setIsViewListingModalOpen(true);
  };

  const handleListProperty = () => {
    setIsSelectModalOpen(true);
  };

  const handleMarkAsSold = (property: Property) => {
    setSelectedPropertyForSale(property);
    setIsMarkAsSoldModalOpen(true);
  };

  if (loading && properties.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Loading properties...
      </div>
    );
  }

  const filteredProperties = properties.filter(prop => {
    const statusMatch = filterStatus === 'all' || prop.status === filterStatus;
    const searchMatch = prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.location.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const statusCounts = {
    total: properties.length,
    drafts: properties.filter(p => p.status === 'available' || p.status === 'draft').length,
    submitted: properties.filter(p => p.status === 'submitted').length,
    approved: properties.filter(p => p.status === 'approved' || p.status === 'published').length,
    rejected: properties.filter(p => p.status === 'rejected').length,
    sold: properties.filter(p => p.status === 'sold').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties Portfolio</h1>
          <p className="text-gray-600 mt-1">Manage your internal inventory and public listings</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleListProperty}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-black font-bold transition flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            List to Public
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Import Verified Project
          </button>
          <button
            onClick={handleAddProperty}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-bold transition flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Property
          </button>
        </div>
      </div>

      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        editId={editingId}
        onSuccess={fetchProperties}
      />

      <SelectPropertyModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        onSuccess={fetchProperties}
      />

      <ViewListingModal
        isOpen={isViewListingModalOpen}
        onClose={() => {
          setIsViewListingModalOpen(false);
          setSelectedPropertyForView(null);
        }}
        property={selectedPropertyForView}
      />

      <ImportReraPropertyModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchProperties}
      />

      <MarkAsSoldModal
        isOpen={isMarkAsSoldModalOpen}
        onClose={() => {
          setIsMarkAsSoldModalOpen(false);
          setSelectedPropertyForSale(null);
        }}
        property={selectedPropertyForSale}
        onSuccess={fetchProperties}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total', count: statusCounts.total, color: 'text-gray-900', bgColor: 'bg-white' },
          { label: 'Drafts', count: statusCounts.drafts, color: 'text-amber-600', bgColor: 'bg-white' },
          { label: 'Submitted', count: statusCounts.submitted, color: 'text-blue-600', bgColor: 'bg-white' },
          { label: 'Approved', count: statusCounts.approved, color: 'text-emerald-600', bgColor: 'bg-white' },
          { label: 'Sold', count: statusCounts.sold, color: 'text-gray-900', bgColor: 'bg-white' },
          { label: 'Rejected', count: statusCounts.rejected, color: 'text-red-600', bgColor: 'bg-white' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bgColor} rounded-lg shadow-sm border border-gray-100 p-4`}>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-black mt-2 ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex-1 w-full relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by title, location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {['all', 'available', 'submitted', 'approved', 'sold', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filterStatus === status
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-shrink-0 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              title="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM14 5a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V5zM4 15a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 15a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Properties List/Grid */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your search or filters to find what you are looking for.'
              : 'Your property portfolio is empty. Add your first property or list existing ones to the public directory.'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Property Details</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type & Category</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProperties.map(property => {
                const statusConfig = PROPERTY_STATUS_CONFIG[property.status];
                const isDraft = property.status === 'available' || property.status === 'draft';
                const canMarkAsSold = property.status === 'available' || property.status === 'draft' || property.status === 'approved' || property.status === 'published';
                const hasListingData = ['submitted', 'approved', 'published', 'rejected'].includes(property.status);

                return (
                  <tr key={property.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{property.title}</p>
                        <p className="text-xs font-semibold text-blue-600 mt-0.5">₹{(property.startingPrice / 100000).toFixed(1)}L+</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{property.location}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ring-1 ring-inset ${statusConfig?.bgColor || 'bg-gray-100'} ${statusConfig?.color || 'text-gray-600'} ${statusConfig?.ringColor || 'ring-gray-200'}`}>
                        {statusConfig?.label || property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 capitalize">{property.propertyType}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        {property.propertyCategory && CATEGORY_CONFIG[property.propertyCategory] ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${CATEGORY_CONFIG[property.propertyCategory].bgColor} ${CATEGORY_CONFIG[property.propertyCategory].color}`}>
                            {CATEGORY_CONFIG[property.propertyCategory].label}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Regular</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {isDraft && (
                          <button
                            onClick={() => handleEditProperty(property.id)}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Edit Basic Info"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {hasListingData && (
                          <button
                            onClick={() => handleViewListingData(property)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Listing Data"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}
                        {canMarkAsSold && (
                          <button
                            onClick={() => handleMarkAsSold(property)}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Mark as Sold"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        <Link
                          href={`/property-partner/dashboard/properties/${property.id}`}
                          className="px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-bold rounded-lg border border-gray-100 hover:bg-white hover:shadow-sm transition-all"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => {
            const statusConfig = PROPERTY_STATUS_CONFIG[property.status];
            const isDraft = property.status === 'available' || property.status === 'draft';
            const canMarkAsSold = property.status === 'available' || property.status === 'draft' || property.status === 'approved' || property.status === 'published';
            const hasListingData = ['submitted', 'approved', 'published', 'rejected'].includes(property.status);

            return (
              <div key={property.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative aspect-video bg-gray-100">
                  {property.videoUrl ? (
                    <video src={property.videoUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                      <svg className="w-12 h-12 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m-4 4l-4-4m9-5l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ${statusConfig?.bgColor || 'bg-white'} ${statusConfig?.color || 'text-gray-900'} ${statusConfig?.ringColor || 'ring-gray-200'}`}>
                      {statusConfig?.label || property.status}
                    </span>
                  </div>
                  {isDraft && (
                    <button
                      onClick={() => handleEditProperty(property.id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-lg text-gray-600 hover:text-amber-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 truncate pr-4">{property.title}</h3>
                    <p className="text-sm font-black text-blue-600">₹{(property.startingPrice / 100000).toFixed(1)}L+</p>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {property.location}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{property.propertyType}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                    {property.propertyCategory && CATEGORY_CONFIG[property.propertyCategory] && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${CATEGORY_CONFIG[property.propertyCategory].bgColor} ${CATEGORY_CONFIG[property.propertyCategory].color}`}>
                        {CATEGORY_CONFIG[property.propertyCategory].label}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex gap-2">
                      {hasListingData && (
                        <button
                          onClick={() => handleViewListingData(property)}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                        >
                          Listing Data
                        </button>
                      )}
                      {canMarkAsSold && (
                        <button
                          onClick={() => handleMarkAsSold(property)}
                          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
                        >
                          Mark Sold
                        </button>
                      )}
                    </div>
                    <Link
                      href={`/property-partner/dashboard/properties/${property.id}`}
                      className="text-[10px] font-bold text-gray-900 group-hover:text-blue-600 uppercase tracking-wider flex items-center gap-1"
                    >
                      View Details
                      <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
