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
import AddUnitModal from '@/app/components/property-partner/AddUnitModal';
import BulkAddUnitModal from '@/app/components/property-partner/BulkAddUnitModal';
import MarkAsSoldModal from '@/app/components/property-partner/MarkAsSoldModal';

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

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { token } = useAuth();
  const { activeContext } = useUnifiedApp();

  const [project, setProject] = useState<Property | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'buildings' | 'blocks' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isMarkAsSoldModalOpen, setIsMarkAsSoldModalOpen] = useState(false);
  const [isBulkAddUnitModalOpen, setIsBulkAddUnitModalOpen] = useState(false);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);

  const fetchProject = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/projects/${projectId}`, {
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

        // Handle city object that may come from API relationship
        const cityName = data.cityName || (typeof data.city === 'object' && data.city?.name ? data.city.name : (data.city || ''));
        // Handle state object that may come from API relationship  
        const stateName = data.state || (typeof data.state === 'object' && data.state?.name ? data.state.name : '');

        const mapped: Property = {
          id: data.id,
          title: data.name,
          propertyType: data.projectType === 'COMMERCIAL' ? 'commercial' : 'residential',
          propertyCategory: data.category?.toLowerCase() as any,
          location: data.location,
          address: data.address || '',
          city: cityName,
          state: stateName,
          pincode: data.pincode || '',
          totalArea: parseFloat(data.area) || 0,
          totalBuildings: data.totalBuildings || 0,
          totalUnits: data.totalUnits || 0,
          startingPrice: parseFloat(data.price) || 0,
          description: description,
          amenities: amenities,
          status: data.status.toLowerCase() as PropertyStatus,
          createdAt: new Date(data.createdAt),
          buildings: [],
          images: [],
          buyerName: data.buyerName,
          buyerPhone: data.buyerPhone,
          salePrice: parseFloat(data.salePrice) || 0,
          soldAt: data.soldAt ? new Date(data.soldAt) : undefined,
        };
        setProject(mapped);
        // Blocks are not supported yet, keeping empty
        setBlocks([]);
      } else {
        console.error('Project not found');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/units/project/${projectId}`);
      if (res.ok) {
        setUnits(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSelectUnit = (id: string) => {
    setSelectedUnitIds(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    const label = getUnitLabel(project?.propertyCategory, true).toLowerCase();
    if (!selectedUnitIds.length) return;
    if (!confirm(`Are you sure you want to delete ${selectedUnitIds.length} ${label}?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/units/bulk`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedUnitIds })
      });

      if (res.ok) {
        fetchUnits();
        setSelectedUnitIds([]);
      } else {
        alert('Failed to delete units');
      }
    } catch (e) {
      console.error('Error in bulk delete:', e);
    }
  };

  const removeUnit = async (id: string) => {
    const label = getUnitLabel(project?.propertyCategory, false).toLowerCase();
    if (!confirm(`Are you sure you want to delete this ${label}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/units/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchUnits();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchUnits();
  }, [projectId, token]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        router.push('/dashboard/projects');
      } else {
        alert('Failed to delete project');
      }
    } catch (e) {
      alert('Error deleting project');
    }
  };

  const getUnitLabel = (category?: string, plural = true) => {
    const cat = category?.toLowerCase();
    if (cat === 'plot') return plural ? 'Plots' : 'Plot';
    if (cat === 'villa') return plural ? 'Villas' : 'Villa';
    if (cat === 'shop') return plural ? 'Shops' : 'Shop';
    if (cat === 'office') return plural ? 'Offices' : 'Office';
    if (cat === 'warehouse') return plural ? 'Warehouses' : 'Warehouse';
    return plural ? 'Units' : 'Unit';
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Project not found</p>
        <Link href="/dashboard/projects" className="text-blue-600 hover:text-blue-700">
          Back to Projects
        </Link>
      </div>
    );
  }

  const statusConfig = PROPERTY_STATUS_CONFIG[project.status];
  const isStandalone = ['plot', 'villa'].includes(project.propertyCategory || '');
  const unitLabel = getUnitLabel(project.propertyCategory);
  const singleUnitLabel = getUnitLabel(project.propertyCategory, false);

  const filteredTabs = TABS.filter(tab => {
    if (isStandalone) {
      return tab.id !== 'buildings';
    }
    return true;
  }).map(tab => {
    if (tab.id === 'blocks') {
      return { ...tab, label: isStandalone ? unitLabel : `Blocks & ${unitLabel}` };
    }
    return tab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.bgColor} ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-gray-600">{project.location} • {project.city}, {project.state}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-blue-600">₹{(project.startingPrice / 100000).toFixed(1)}L+</p>
          <p className="text-sm text-gray-600 mt-1">Starting Price</p>
          {(project.status as string) === 'draft' && (
            <Link
              href={`/dashboard/projects/add?id=${project.id}`}
              className="mt-2 inline-block px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 text-sm font-medium transition"
            >
              Continue Editing
            </Link>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className={`grid gap-4 ${isStandalone ? 'md:grid-cols-2' : 'md:grid-cols-4'}`}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 font-bold text-gray-900">
          <p className="text-gray-600 text-sm font-medium">Total Area</p>
          <p className="text-2xl mt-1">{project.totalArea.toLocaleString()} Sq Ft</p>
        </div>
        {!isStandalone && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 font-bold text-gray-900">
            <p className="text-gray-600 text-sm font-medium">Buildings</p>
            <p className="text-2xl mt-1">{project.totalBuildings}</p>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 font-bold text-gray-900">
          <p className="text-gray-600 text-sm font-medium">Total {unitLabel}</p>
          <p className="text-2xl mt-1">{units.length || project.totalUnits}</p>
        </div>
        {!isStandalone && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 font-bold text-gray-900">
            <p className="text-gray-600 text-sm font-medium">Blocks</p>
            <p className="text-2xl mt-1">{blocks.length}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {filteredTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition whitespace-nowrap ${activeTab === tab.id
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
                <dl className="grid md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-600">Address</dt>
                    <dd className="text-gray-900 font-medium">{project.address}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">City</dt>
                    <dd className="text-gray-900 font-medium">{project.city}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">State</dt>
                    <dd className="text-gray-900 font-medium">{project.state}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Pincode</dt>
                    <dd className="text-gray-900 font-medium">{project.pincode}</dd>
                  </div>
                </dl>
              </div>

              {project.amenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {project.amenities.map(amenity => (
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
              {project.status === 'sold' && (
                <div className="mt-8 bg-emerald-50 rounded-2xl border-2 border-emerald-100 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Sale Information
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <dt className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Sold To</dt>
                      <dd className="text-lg font-black text-emerald-900">{project.buyerName}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Contact</dt>
                      <dd className="text-lg font-black text-emerald-900">{project.buyerPhone}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Sale Price</dt>
                      <dd className="text-lg font-black text-emerald-900">₹{project.salePrice?.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Date of Sale</dt>
                      <dd className="text-lg font-black text-emerald-900">
                        {project.soldAt ? project.soldAt.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </dd>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Buildings Tab */}
          {activeTab === 'buildings' && (
            <div className="space-y-4">
              {project.buildings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No buildings added yet</p>
                </div>
              ) : (
                project.buildings.map(building => (
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
                <h3 className="text-lg font-semibold text-gray-900">{isStandalone ? `${unitLabel} Overview` : `Blocks & ${unitLabel} Overview`}</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsMarkAsSoldModalOpen(true)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium transition"
                  >
                    Mark {singleUnitLabel} as Sold
                  </button>
                  <button
                    onClick={() => setIsAddUnitModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                  >
                    Add {singleUnitLabel}
                  </button>
                  <button
                    onClick={() => setIsBulkAddUnitModalOpen(true)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium transition flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Bulk Add
                  </button>
                  {selectedUnitIds.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 text-sm font-bold border border-red-200"
                    >
                      Delete {selectedUnitIds.length} Selected
                    </button>
                  )}
                </div>
              </div>

              {units.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-gray-500 text-lg font-medium mb-4">No {unitLabel.toLowerCase()} created yet</p>
                  <button
                    onClick={() => setIsAddUnitModalOpen(true)}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition text-sm"
                  >
                    Create First {singleUnitLabel}
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {units.map((unit: any) => (
                    <div
                      key={unit.id}
                      className={`p-6 border bg-white rounded-xl shadow-sm hover:shadow-md transition relative overflow-hidden ${selectedUnitIds.includes(unit.id) ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}
                      onClick={() => toggleSelectUnit(unit.id)}
                    >
                      <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedUnitIds.includes(unit.id)}
                          onChange={() => toggleSelectUnit(unit.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                      </div>
                      <div className="flex justify-between items-start mb-4 pl-4">
                        <div>
                          <h4 className="font-bold text-gray-900 text-xl">{unit.unitNumber}</h4>
                          <p className="text-sm text-gray-500">{unit.type || `Standard ${singleUnitLabel}`} {!isStandalone && `• Floor ${unit.floor || 'N/A'}`}</p>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => removeUnit(unit.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Unit"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${unit.status === 'SOLD' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {unit.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                            Area
                          </span>
                          <span className="font-semibold text-gray-900">{unit.area ? `${unit.area} Sq Ft` : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Price
                          </span>
                          <span className="font-semibold text-gray-900">₹{unit.price.toLocaleString()}</span>
                        </div>
                      </div>

                      {unit.status === 'SOLD' && (
                        <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-sm">
                          <p className="text-emerald-800 font-medium">Sold To: <span className="font-bold">{unit.buyerName}</span></p>
                          <p className="text-emerald-600 text-xs mt-1">₹{unit.salePrice.toLocaleString()} on {new Date(unit.soldAt).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h3>
                <p className="text-gray-700 mb-4">Current Status: <span className={`font-bold ${statusConfig.color}`}>{statusConfig.label}</span></p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Type</h3>
                <p className="text-gray-700 capitalize">{project.propertyType.replace('-', ' ')}</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-red-600">Danger Zone</h3>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition text-sm"
                >
                  Delete Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddUnitModal
        isOpen={isAddUnitModalOpen}
        onClose={() => setIsAddUnitModalOpen(false)}
        projectId={projectId}
        projectCategory={project?.propertyCategory}
        onAdded={fetchUnits}
      />

      <MarkAsSoldModal
        isOpen={isMarkAsSoldModalOpen}
        onClose={() => setIsMarkAsSoldModalOpen(false)}
        projectId={projectId}
        units={units}
        onSold={fetchProject}
      />

      <BulkAddUnitModal
        isOpen={isBulkAddUnitModalOpen}
        onClose={() => setIsBulkAddUnitModalOpen(false)}
        projectId={project.id}
        projectCategory={project.propertyCategory as any}
        onAdded={fetchProject}
      />
    </div>
  );
}
