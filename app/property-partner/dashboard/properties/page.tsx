'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Property, PropertyStatus, PropertyCategory } from '@/app/types/property';
import { PROPERTY_STATUS_CONFIG, PROPERTY_TYPES } from '@/app/constants/property';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import AddPropertyModal from '@/app/components/property-partner/AddPropertyModal';

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
  const regionCode = activeContext.activeRegion.code;

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchProperties = async () => {
    if (!token || !regionCode) return;

    try {
      setLoading(true);
      // Fetch "my" properties
      const res = await fetch(`${API_URL}/api/${regionCode}/properties?myOnly=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        // Map backend data to frontend Property interface
        const mapped: Property[] = data.map((p: any) => {
          // Backend returns status as uppercase (e.g., 'AVAILABLE', 'SUBMITTED')
          const backendStatus = p.status?.toUpperCase();
          let frontendStatus: PropertyStatus = 'available'; // default

          switch (backendStatus) {
            case 'AVAILABLE':
              frontendStatus = 'available';
              break;
            case 'SUBMITTED':
              frontendStatus = 'submitted';
              break;
            case 'APPROVED':
              frontendStatus = 'approved';
              break;
            case 'REJECTED':
              frontendStatus = 'rejected';
              break;
            case 'PUBLISHED':
              frontendStatus = 'published';
              break;
            case 'DRAFT':
              frontendStatus = 'draft';
              break;
            default:
              frontendStatus = p.status?.toLowerCase() as PropertyStatus;
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
            pincode: '',
            totalArea: parseFloat(p.area) || 0,
            totalBuildings: 0,
            totalUnits: 0,
            startingPrice: parseFloat(p.price) || 0,
            description: p.description || '',
            amenities: [],
            status: frontendStatus,
            createdAt: new Date(p.createdAt),
          };
        });

        console.log('Fetched properties:', mapped.map(p => ({ id: p.id, title: p.title, status: p.status })));
        setProperties(mapped);
      } else {
        console.error('Failed to fetch properties');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [token, regionCode]);

  const handleAddProperty = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditProperty = (id: string) => {
    setEditingId(id);
    setIsModalOpen(true);
  };

  if (loading && properties.length === 0) {
    return <div className="p-8 text-center text-gray-500">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      Loading properties...
    </div>;
  }

  const filteredProperties = properties.filter(prop => {
    // Show all internal inventory
    // This is the builder's complete property portfolio
    const allowedStatuses: PropertyStatus[] = ['available', 'submitted', 'rejected', 'draft', 'approved', 'published'];

    if (!allowedStatuses.includes(prop.status)) return false;

    // When 'available' filter is selected, show anything that is part of internal inventory
    // (available, submitted, rejected, draft)
    const statusMatch = filterStatus === 'all'
      || (filterStatus === 'available' && (prop.status === 'available' || prop.status === 'submitted' || prop.status === 'draft' || prop.status === 'rejected'))
      || prop.status === filterStatus;

    const searchMatch = prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.location.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const statusCounts = {
    available: properties.filter(p => p.status === 'available' || p.status === 'submitted' || p.status === 'draft' || p.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600 mt-1">Manage your internal inventory and property details</p>
        </div>
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

      <AddPropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editId={editingId}
        onSuccess={fetchProperties}
      />

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-gray-600 text-sm font-medium">Available (Internal)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{statusCounts.available}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-gray-600 text-sm font-medium">Total Inventory</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{properties.length}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Search properties by name or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('available')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterStatus === 'available'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Available ({statusCounts.available})
            </button>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${viewMode === 'list'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
              title="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${viewMode === 'grid'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m-4 4l-4-4m9-5l4-4m-4 4l-4-4" />
          </svg>
          <p className="text-gray-500 text-lg font-medium mb-2">No properties found</p>
          <p className="text-gray-400 mb-4">
            {searchQuery || filterStatus !== 'all' ? 'Try adjusting your search or filters' : 'Create your first property to get started'}
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <p className="text-sm text-gray-400">Click the &quot;Add Property&quot; button above to create your first listing</p>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Buildings</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Category</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProperties.map(property => {
                const statusConfig = PROPERTY_STATUS_CONFIG[property.status];
                return (
                  <tr key={property.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{property.title}</p>
                        <p className="text-sm text-gray-500">₹{(property.startingPrice / 100000).toFixed(1)}L+</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{property.location}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 capitalize">{property.propertyType.replace('-', ' ')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{property.totalBuildings}</p>
                    </td>
                    <td className="px-6 py-4">
                      {property.propertyCategory && CATEGORY_CONFIG[property.propertyCategory] ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${CATEGORY_CONFIG[property.propertyCategory].bgColor} ${CATEGORY_CONFIG[property.propertyCategory].color}`}>
                          {CATEGORY_CONFIG[property.propertyCategory].label}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          Flat
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {(['available', 'rejected'].includes(property.status)) && (
                          <button
                            onClick={() => handleEditProperty(property.id)}
                            className="text-amber-600 hover:text-amber-700 font-bold text-sm"
                          >
                            Edit
                          </button>
                        )}
                        <Link
                          href={`/property-partner/dashboard/properties/${property.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View
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
            return (
              <div key={property.id} className="relative group">
                <Link
                  href={`/property-partner/dashboard/properties/${property.id}`}
                  className="block bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition h-full"
                >
                  <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                    <svg className="w-16 h-16 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m-4 4l-4-4m9-5l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 truncate pr-2">{property.title}</h3>
                      {(['available', 'rejected'].includes(property.status)) && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditProperty(property.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-gray-100 hover:bg-amber-50 text-gray-500 hover:text-amber-600 rounded-lg"
                          title="Edit Property"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{property.location}</p>
                    <div className="flex items-center justify-between mb-3">
                      {property.propertyCategory && CATEGORY_CONFIG[property.propertyCategory] ? (
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${CATEGORY_CONFIG[property.propertyCategory].bgColor} ${CATEGORY_CONFIG[property.propertyCategory].color}`}>
                          {CATEGORY_CONFIG[property.propertyCategory].label}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                          Flat
                        </span>
                      )}
                      <p className="text-sm font-semibold text-gray-700">₹{(property.startingPrice / 100000).toFixed(1)}L+</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <p className="text-gray-500">Buildings</p>
                        <p className="font-bold text-gray-900">{property.totalBuildings}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Units</p>
                        <p className="font-bold text-gray-900">{property.totalUnits}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Area</p>
                        <p className="font-bold text-gray-900">{property.totalArea}K</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div >
      )}
    </div >
  );
}
