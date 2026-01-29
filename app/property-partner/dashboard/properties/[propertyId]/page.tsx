'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Property, PropertyStatus } from '@/app/types/property';
import { Block } from '@/app/types/block';
import { PROPERTY_STATUS_CONFIG } from '@/app/constants/property';
import { STATUS_CONFIG } from '@/app/constants/block';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface TabType {
  id: 'overview' | 'buildings' | 'blocks' | 'settings';
  label: string;
  icon: React.ReactNode;
}

const TABS: TabType[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    id: 'buildings',
    label: 'Buildings',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m-4 4l-4-4m9-5l4-4m-4 4l-4-4" /></svg>,
  },
  {
    id: 'blocks',
    label: 'Blocks & Units',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10M7 12l8 4m0 0l8-4" /></svg>,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
];

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;
  const { token } = useAuth();
  const { activeContext } = useUnifiedApp();
  const regionCode = activeContext.activeRegion.code;

  const [property, setProperty] = useState<Property | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'buildings' | 'blocks' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!token || !regionCode) return;

      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/${regionCode}/properties/${propertyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();

          // Extract amenities from description
          let description = data.description || '';
          let amenities: string[] = [];
          if (description.includes('Amenities:')) {
            const parts = description.split('Amenities:');
            description = parts[0].trim(); // Remove amenities string from display description
            amenities = parts[1].split(',').map((a: string) => a.trim());
          }

          const mapped: Property = {
            id: data.id,
            title: data.name,
            propertyType: data.propertyType === 'COMMERCIAL' ? 'commercial' : 'residential',
            location: data.location,
            address: data.address || '',
            city: '',
            state: '',
            pincode: '',
            totalArea: parseFloat(data.area) || 0,
            totalBuildings: 0,
            totalUnits: 0, // Backend doesn't support yet
            startingPrice: parseFloat(data.price) || 0,
            description: description,
            amenities: amenities,
            status: data.status.toLowerCase() as PropertyStatus,
            createdAt: new Date(data.createdAt),
            buildings: [],
            images: [],
          };
          setProperty(mapped);
          // Blocks are not supported yet, keeping empty
          setBlocks([]);
        } else {
          console.error('Property not found');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, token, regionCode]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const res = await fetch(`${API_URL}/api/${regionCode}/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        router.push('/property-partner/dashboard/properties');
      } else {
        alert('Failed to delete property');
      }
    } catch (e) {
      alert('Error deleting property');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Property not found</p>
        <Link href="/property-partner/dashboard/properties" className="text-blue-600 hover:text-blue-700">
          Back to Properties
        </Link>
      </div>
    );
  }

  const statusConfig = PROPERTY_STATUS_CONFIG[property.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.bgColor} ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-gray-600">{property.location} • {property.city}, {property.state}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-blue-600">₹{(property.startingPrice / 100000).toFixed(1)}L+</p>
          <p className="text-sm text-gray-600 mt-1">Starting Price</p>
          {property.status === 'draft' && (
            <Link
              href={`/property-partner/dashboard/properties/add?id=${property.id}`}
              className="mt-2 inline-block px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 text-sm font-medium transition"
            >
              Continue Editing
            </Link>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-gray-600 text-sm">Total Area</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{property.totalArea.toLocaleString()} Sq Ft</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-gray-600 text-sm">Buildings</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{property.totalBuildings}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-gray-600 text-sm">Total Units</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{property.totalUnits}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-gray-600 text-sm">Blocks</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{blocks.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
                <dl className="grid md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-600">Address</dt>
                    <dd className="text-gray-900 font-medium">{property.address}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">City</dt>
                    <dd className="text-gray-900 font-medium">{property.city}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">State</dt>
                    <dd className="text-gray-900 font-medium">{property.state}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Pincode</dt>
                    <dd className="text-gray-900 font-medium">{property.pincode}</dd>
                  </div>
                </dl>
              </div>

              {property.amenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {property.amenities.map(amenity => (
                      <div key={amenity} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Buildings Tab */}
          {activeTab === 'buildings' && (
            <div className="space-y-4">
              {property.buildings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No buildings added yet</p>
                </div>
              ) : (
                property.buildings.map(building => (
                  <div key={building.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{building.name}</h4>
                        <p className="text-sm text-gray-600">Code: {building.code} • {building.totalFloors} floors</p>
                      </div>
                    </div>
                    {building.description && (
                      <p className="text-sm text-gray-700 mt-2">{building.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Blocks & Units Tab */}
          {activeTab === 'blocks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Blocks Overview</h3>
                <Link
                  href={`/property-partner/dashboard/projects/${property.id}/buildings/building-001/blocks/add`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                >
                  Add Block
                </Link>
              </div>

              {blocks.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10M7 12l8 4m0 0l8-4" />
                  </svg>
                  <p className="text-gray-500 text-lg font-medium mb-4">No blocks created yet</p>
                  <Link
                    href={`/property-partner/dashboard/projects/${property.id}/buildings/building-001/blocks/add`}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition text-sm"
                  >
                    Create First Block
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blocks.map(block => {
                    const blockStatusConfig = STATUS_CONFIG[block.status];
                    const totalUnits = block.floors?.reduce((sum, floor) => sum + floor.totalUnits, 0) || 0;
                    const bookedUnits = block.floors?.reduce((sum, floor) => sum + floor.bookedUnits, 0) || 0;

                    return (
                      <Link
                        key={block.id}
                        href={`/property-partner/dashboard/projects/${block.projectId}/buildings/${block.buildingId}/blocks/${block.id}`}
                        className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-gray-900">{block.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${blockStatusConfig.color}`}>
                            {blockStatusConfig.label}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">Code: {block.code}</p>

                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Units:</span>
                            <span className="font-semibold text-gray-900">{totalUnits}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Booked:</span>
                            <span className="font-semibold text-blue-600">{bookedUnits}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Available:</span>
                            <span className="font-semibold text-green-600">{totalUnits - bookedUnits}</span>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full transition-all"
                            style={{ width: `${(bookedUnits / totalUnits) * 100}%` }}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Status</h3>
                <p className="text-gray-700 mb-4">Current Status: <span className={`font-bold ${statusConfig.color}`}>{statusConfig.label}</span></p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition text-sm">
                    Submit for Approval
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition text-sm">
                    Save as Draft
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Type</h3>
                <p className="text-gray-700 capitalize">{property.propertyType.replace('-', ' ')}</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-red-600">Danger Zone</h3>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition text-sm"
                >
                  Delete Property
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
