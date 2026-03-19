'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Property, PropertyStatus } from '@/app/types/property';
import { Block } from '@/app/types/block';
import { PROPERTY_STATUS_CONFIG, PROPERTY_TYPES } from '@/app/constants/property';
import { STATUS_CONFIG } from '@/app/constants/block';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import AddUnitModal from '@/app/components/property-partner/AddUnitModal';
import BulkAddUnitModal from '@/app/components/property-partner/BulkAddUnitModal';
import MarkAsSoldModal from '@/app/components/property-partner/MarkAsSoldModal';
import AddTowerModal from '@/app/components/property-partner/AddTowerModal';
import SidebarIcon from '@/app/components/SidebarIcon';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface TabType {
  id: 'overview' | 'towers' | 'blocks' | 'media' | 'settings';
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
    id: 'towers',
    label: 'Tower & Blocks',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m-4 4l-4-4m9-5l4-4m-4 4l-4-4" /></svg>,
  },
  {
    id: 'blocks',
    label: 'Units',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10M7 12l8 4m0 0l8-4" /></svg>,
  },
  {
    id: 'media',
    label: 'Media',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
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
  const [activeTab, setActiveTab] = useState<'overview' | 'towers' | 'blocks' | 'media' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isMarkAsSoldModalOpen, setIsMarkAsSoldModalOpen] = useState(false);
  const [isBulkAddUnitModalOpen, setIsBulkAddUnitModalOpen] = useState(false);
  const [isAddTowerModalOpen, setIsAddTowerModalOpen] = useState(false);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUnits, setTotalUnits] = useState(0);
  const UNITS_PER_PAGE = 12;


  // Editing States
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingAmenities, setIsEditingAmenities] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editData, setEditData] = useState({
    description: '',
    amenities: [] as string[],
    address: '',
    city: '',
    state: '',
    pincode: '',
    area: '',
    highlights: [] as string[],
    title: '',
    price: '',
  });

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [isEditingHighlights, setIsEditingHighlights] = useState(false);
  const [newAmenity, setNewAmenity] = useState('');
  const [newHighlight, setNewHighlight] = useState('');

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

        // Extract amenities - check dedicated field first, then fallback to description
        let amenities: string[] = data.amenities || [];
        let description = data.description || '';
        
        if (amenities.length === 0 && description.includes('Amenities:')) {
          const parts = description.split('Amenities:');
          description = parts[0].trim();
          amenities = parts[1].split(',').map((a: string) => a.trim());
        } else if (description.includes('Amenities:')) {
          // If we have proper amenities field, just clean up the description
          description = description.split('Amenities:')[0].trim();
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
          totalTowers: data.totalTowers || 0,
          totalUnits: data.totalUnits || 0,
          startingPrice: parseFloat(data.price) || 0,
          description: description,
          amenities: amenities,
          highlights: data.highlights || [],
          status: data.status.toLowerCase() as PropertyStatus,
          createdAt: new Date(data.createdAt),
          towers: data.towers || [],
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

  const handleUpdateProject = async (updates: any) => {
    if (!token || !project) return;
    try {
      setLoading(true);

      // Merge with existing data if needed, but usually API handles partial updates
      const res = await fetch(`${API_URL}/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        await fetchProject();
        return true;
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update project');
        return false;
      }
    } catch (e) {
      console.error(e);
      alert('Error updating project');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const startEditingDescription = () => {
    setEditData(prev => ({ ...prev, description: project?.description || '' }));
    setIsEditingDescription(true);
  };

  const saveDescription = async () => {
    const success = await handleUpdateProject({
      description: editData.description
    });
    if (success) setIsEditingDescription(false);
  };

  const startEditingAmenities = () => {
    setEditData(prev => ({ ...prev, amenities: project?.amenities || [] }));
    setIsEditingAmenities(true);
  };

  const saveAmenities = async () => {
    const success = await handleUpdateProject({
      amenities: editData.amenities
    });
    if (success) setIsEditingAmenities(false);
  };

  const toggleAmenity = (amenity: string) => {
    setEditData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const addCustomAmenity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAmenity.trim() && !editData.amenities.includes(newAmenity.trim())) {
      setEditData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const toggleHighlight = (highlight: string) => {
    setEditData(prev => ({
      ...prev,
      highlights: prev.highlights.includes(highlight)
        ? prev.highlights.filter(h => h !== highlight)
        : [...prev.highlights, highlight]
    }));
  };

  const addCustomHighlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHighlight.trim() && !editData.highlights.includes(newHighlight.trim())) {
      setEditData(prev => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight.trim()]
      }));
      setNewHighlight('');
    }
  };

  const saveHighlights = async () => {
    const success = await handleUpdateProject({
      highlights: editData.highlights
    });
    if (success) setIsEditingHighlights(false);
  };

  const startEditingLocation = () => {
    setEditData(prev => ({
      ...prev,
      address: project?.address || '',
      city: project?.city || '',
      state: project?.state || '',
      pincode: project?.pincode || '',
    }));
    setIsEditingLocation(true);
  };

  const saveLocation = async () => {
    const success = await handleUpdateProject({
      address: editData.address,
      cityName: editData.city,
      state: editData.state,
      pincode: editData.pincode,
    });
    if (success) setIsEditingLocation(false);
  };

  const startEditingStats = () => {
    setEditData(prev => ({
      ...prev,
      title: project?.title || '',
      price: project?.startingPrice.toString() || '',
      area: project?.totalArea.toString() || '',
    }));
    setIsEditingStats(true);
  };

  const saveStats = async () => {
    const success = await handleUpdateProject({
      name: editData.title,
      price: parseFloat(editData.price) || 0,
      area: parseFloat(editData.area) || 0,
    });
    if (success) setIsEditingStats(false);
  };

  const [uploadingFile, setUploadingFile] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'brochure' | 'specification') => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/api/uploads`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const url = data.url;

        let updates: any = {};
        if (type === 'video') updates.videoUrl = url;
        // Images and docs might need special handling based on schema
        // For now let's update what we can

        await handleUpdateProject(updates);
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const fetchTowers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/towers/project/${projectId}`);
      if (res.ok) {
        const towersData = await res.json();
        setProject(prev => prev ? { ...prev, towers: towersData } : null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUnits = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/units/project/${projectId}?page=${currentPage}&limit=${UNITS_PER_PAGE}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnits(data.units);
        setTotalUnits(data.total);
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
  const removeTower = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete tower "${name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/towers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchTowers();
        fetchUnits();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete tower');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting tower');
    }
  };

  useEffect(() => {
    fetchProject();
    fetchTowers();
    setCurrentPage(1);
  }, [projectId, token]);

  useEffect(() => {
    fetchUnits();
  }, [projectId, token, currentPage]);


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
      return tab.id !== 'towers';
    }
    return true;
  }).map(tab => {
    if (tab.id === 'blocks') {
      return { ...tab, label: unitLabel };
    }
    return tab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            {isEditingStats ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="text-3xl font-bold text-gray-900 border-b border-blue-600 focus:outline-none bg-blue-50/30 px-2 rounded"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.bgColor} ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-gray-600">{project.location} • {project.city}, {project.state}</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          {isEditingStats ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">₹</span>
              <input
                type="number"
                value={editData.price}
                onChange={(e) => setEditData(prev => ({ ...prev, price: e.target.value }))}
                className="text-3xl font-bold text-blue-600 border-b border-blue-600 focus:outline-none bg-blue-50/30 px-2 rounded w-48 text-right"
              />
            </div>
          ) : (
            <p className="text-3xl font-bold text-blue-600">₹{(project.startingPrice / 100000).toFixed(1)}L+</p>
          )}
          <p className="text-sm text-gray-600">Starting Price</p>

          <div className="flex gap-2">
            {!isEditingStats ? (
              <button
                onClick={startEditingStats}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 text-sm font-bold transition shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Details
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditingStats(false)}
                  className="mt-2 px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 text-sm font-bold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveStats}
                  className="mt-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-bold transition shadow-md shadow-emerald-200"
                >
                  Save All Changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={`grid gap-4 ${isStandalone ? 'md:grid-cols-2' : 'md:grid-cols-4'}`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 font-bold text-gray-900 group relative">
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Total Area</p>
          {isEditingStats ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editData.area}
                onChange={(e) => setEditData(prev => ({ ...prev, area: e.target.value }))}
                className="text-2xl mt-1 w-full border-b border-blue-600 focus:outline-none bg-blue-50/30 px-1 rounded"
              />
              <span className="text-xs text-gray-400">Sq Ft</span>
            </div>
          ) : (
            <p className="text-2xl mt-1 tracking-tight">{project.totalArea.toLocaleString()} <span className="text-xs text-gray-400 font-medium">Sq Ft</span></p>
          )}
        </div>

        {!isStandalone && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 font-bold text-gray-900">
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Tower</p>
            <p className="text-2xl mt-1 tracking-tight">{project.towers.length}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 font-bold text-gray-900">
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{unitLabel}</p>
          <p className="text-2xl mt-1 tracking-tight">{totalUnits}</p>
        </div>
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Project Description Section */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <SidebarIcon name="clipboard" className="w-4 h-4" />
                    Project Description
                  </h3>
                  {!isEditingDescription ? (
                    <button onClick={startEditingDescription} className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1">
                      <SidebarIcon name="note" className="w-4 h-4" /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={() => setIsEditingDescription(false)} className="text-slate-400 hover:text-slate-500 text-sm font-bold">Cancel</button>
                      <button onClick={saveDescription} className="text-emerald-600 hover:text-emerald-700 text-sm font-bold">Save</button>
                    </div>
                  )}
                </div>
                {isEditingDescription ? (
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                ) : (
                  <p className="text-slate-600 leading-relaxed font-bold italic whitespace-pre-wrap">
                    &quot;{project?.description || "No description provided."}&quot;
                  </p>
                )}
              </div>

              {/* Key Highlights Section */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <SidebarIcon name="star" className="w-4 h-4" />
                    Key Highlights
                  </h3>
                  {!isEditingHighlights ? (
                    <button onClick={() => {
                        setEditData(prev => ({ ...prev, highlights: project?.highlights || [] }));
                        setIsEditingHighlights(true);
                      }} className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1">
                      <SidebarIcon name="note" className="w-4 h-4" /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={() => {
                        setIsEditingHighlights(false);
                        setNewHighlight('');
                      }} className="text-slate-400 hover:text-slate-500 text-sm font-bold">Cancel</button>
                      <button onClick={saveHighlights} className="text-emerald-600 hover:text-emerald-700 text-sm font-bold">Save</button>
                    </div>
                  )}
                </div>

                {isEditingHighlights ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {editData.highlights.length > 0 ? (
                        editData.highlights.map(h => (
                          <div key={h} className="flex items-center justify-between p-3 rounded-xl border border-emerald-500 bg-emerald-50 text-emerald-700 font-medium text-sm">
                            <span className="truncate">{h}</span>
                            <button
                              type="button"
                              onClick={() => toggleHighlight(h)}
                              className="text-emerald-400 hover:text-red-500 transition-colors ml-2"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-xs italic col-span-full text-left">No highlights added yet.</p>
                      )}
                    </div>
                    <form onSubmit={addCustomHighlight} className="flex gap-2">
                      <input
                        type="text"
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        placeholder="Add key highlight (e.g. Vastu Compliant)"
                        className="flex-1 px-4 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project?.highlights && project.highlights.length > 0 ? (
                      project.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                          <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <span className="text-slate-700 font-bold text-sm">{h}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm italic col-span-full text-left">Define what makes this property unique.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Location Details Section */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <SidebarIcon name="pin" className="w-4 h-4" />
                    Location Details
                  </h3>
                  {!isEditingLocation ? (
                    <button onClick={startEditingLocation} className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1">
                      <SidebarIcon name="note" className="w-4 h-4" /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={() => setIsEditingLocation(false)} className="text-slate-400 hover:text-slate-500 text-sm font-bold">Cancel</button>
                      <button onClick={saveLocation} className="text-emerald-600 hover:text-emerald-700 text-sm font-bold">Save</button>
                    </div>
                  )}
                </div>
                {isEditingLocation ? (
                  <div className="grid md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 text-left">Street Address</label>
                      <textarea
                        value={editData.address}
                        onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm"
                        rows={2}
                      />
                    </div>
                    <div className="text-left">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">City</label>
                      <input
                        type="text"
                        value={editData.city}
                        onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                    <div className="text-left">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">State</label>
                      <input
                        type="text"
                        value={editData.state}
                        onChange={(e) => setEditData(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                    <div className="text-left">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pincode</label>
                      <input
                        type="text"
                        value={editData.pincode}
                        onChange={(e) => setEditData(prev => ({ ...prev, pincode: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
                    <div>
                      <dt className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Address</dt>
                      <dd className="text-slate-900 font-bold">{project.address || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">City</dt>
                      <dd className="text-slate-900 font-bold">{project.city || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">State</dt>
                      <dd className="text-slate-900 font-bold">{project.state || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Pincode</dt>
                      <dd className="text-slate-900 font-bold">{project.pincode || 'N/A'}</dd>
                    </div>
                  </dl>
                )}
              </div>

              {/* Amenities Section */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <SidebarIcon name="building" className="w-4 h-4" />
                    Amenities
                  </h3>
                  {!isEditingAmenities ? (
                    <button onClick={startEditingAmenities} className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1">
                      <SidebarIcon name="note" className="w-4 h-4" /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditingAmenities(false)} className="text-slate-400 hover:text-slate-500 text-sm font-bold">Cancel</button>
                      <button onClick={saveAmenities} className="text-emerald-600 hover:text-emerald-700 text-sm font-bold">Save</button>
                    </div>
                  )}
                </div>
                {isEditingAmenities ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-3">
                      {editData.amenities.length > 0 ? (
                        editData.amenities.map(amenity => (
                          <div key={amenity} className="flex items-center justify-between p-3 rounded-xl border border-blue-500 bg-blue-50 text-blue-700 font-medium text-sm">
                            <div className="flex items-center truncate">
                              <svg className="w-4 h-4 text-blue-600 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                              <span className="truncate">{amenity}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleAmenity(amenity)}
                              className="text-blue-400 hover:text-red-500 transition-colors ml-2"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-xs italic col-span-3 text-left">No amenities added yet. Use the field below to add some.</p>
                      )}
                    </div>

                    <form onSubmit={addCustomAmenity} className="flex gap-2">
                      <input
                        type="text"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        placeholder="Add individual custom amenity..."
                        className="flex-1 px-4 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-3">
                    {project.amenities.length > 0 ? project.amenities.map(amenity => (
                      <div key={amenity} className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-slate-700 font-bold text-sm">{amenity}</span>
                      </div>
                    )) : (
                      <p className="text-slate-400 text-sm italic col-span-3 text-left">No amenities listed yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Towers Tab */}
          {activeTab === 'towers' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Tower & Blocks</h3>
                  <p className="text-sm text-gray-500">Manage towers and blocks for this project</p>
                </div>
                <button
                  onClick={() => setIsAddTowerModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add New Tower
                </button>
              </div>

              {project.towers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-gray-500">No towers added yet</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {project.towers.map(tower => (
                    <div key={tower.id} className="p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-xl transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <button
                          onClick={() => removeTower(tower.id, tower.name)}
                          className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 italic text-xs font-bold"
                        >
                          Delete
                        </button>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{tower.name}</h4>
                        <p className="text-sm text-gray-500 mt-1 font-medium">{tower.totalFloors || 'N/A'} Floors • {tower.units?.length || 0} Units</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Units Tab */}
          {activeTab === 'blocks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">{isStandalone ? `${unitLabel} Overview` : `${unitLabel} Overview`}</h3>
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
                <div className="space-y-6">
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
                            <p className="text-sm text-gray-500">
                              {unit.type || `Standard ${singleUnitLabel}`} 
                              {!isStandalone && ` • Floor ${unit.floor || 'N/A'}`}
                              {unit.tower?.name && ` • ${unit.tower.name}`}
                            </p>
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

                  {totalUnits > UNITS_PER_PAGE && (
                    <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                      <p className="text-sm text-gray-500 font-medium">
                        Showing <span className="text-gray-900">{(currentPage - 1) * UNITS_PER_PAGE + 1}</span> to <span className="text-gray-900">{Math.min(currentPage * UNITS_PER_PAGE, totalUnits)}</span> of <span className="text-gray-900">{totalUnits}</span> units
                      </p>
                      <div className="flex gap-2">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => prev - 1)}
                          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all font-bold"
                        >
                          Previous
                        </button>
                        <button
                          disabled={currentPage * UNITS_PER_PAGE >= totalUnits}
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all font-bold"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              )}
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="space-y-8">
              {/* Project Video */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Project Video</h3>
                    <p className="text-sm text-gray-500">High-quality promotional video for public listing</p>
                  </div>
                  <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">
                    <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} disabled={uploadingFile} />
                    {uploadingFile ? 'Uploading...' : 'Upload Video'}
                  </label>
                </div>

                {project?.videoUrl ? (
                  <div className="relative aspect-video max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-black">
                    <video src={project.videoUrl} controls className="w-full h-full" />
                    <button
                      onClick={() => handleUpdateProject({ videoUrl: null })}
                      className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video max-w-2xl mx-auto rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center bg-white">
                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    <p className="text-gray-400 font-medium">No video uploaded</p>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4">Project Brochure</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                      <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">Brochure.pdf</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">PDF Document</p>
                      </div>
                    </div>
                    <label className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition">
                      <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, 'brochure')} />
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </label>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4">Specifications</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                      <svg className="w-8 h-8 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">Spec_Details.pdf</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">PDF Document</p>
                      </div>
                    </div>
                    <label className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition">
                      <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, 'specification')} />
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Project Status</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PROPERTY_STATUS_CONFIG).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateProject({ status: status.toUpperCase() })}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ring-1 ring-inset ${project.status === status
                        ? `${config.bgColor} ${config.color} ${config.ringColor} shadow-md`
                        : 'bg-gray-50 text-gray-400 ring-gray-100 hover:bg-gray-100'}`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                  Changing the status affects how this project is displayed in the portfolio and public search results.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Project Type</h3>
                <div className="grid grid-cols-3 gap-3">
                  {PROPERTY_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => handleUpdateProject({ projectType: type.value.toUpperCase() })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${project.propertyType === type.value
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100'
                        : 'border-gray-50 hover:border-gray-200 bg-gray-50/30'}`}
                    >
                      <h4 className={`font-bold text-sm ${project.propertyType === type.value ? 'text-blue-700' : 'text-gray-900'}`}>{type.label}</h4>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">Primary Category</p>
                    </button>
                  ))}
                </div>
              </div>

              {['submitted', 'rejected'].includes(project.status) && (
                <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-100/50">
                  <h3 className="text-lg font-bold text-red-700 mb-2">Danger Zone</h3>
                  <p className="text-sm text-red-600 mb-6 font-medium">Permanently delete this project and all its associated data. This action cannot be undone.</p>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold transition text-sm shadow-lg shadow-red-100"
                  >
                    Delete Project Portfolio
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddUnitModal
        isOpen={isAddUnitModalOpen}
        onClose={() => setIsAddUnitModalOpen(false)}
        projectId={projectId}
        projectCategory={project?.propertyCategory}
        onAdded={() => { fetchUnits(); fetchTowers(); }}
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
        projectId={projectId}
        projectCategory={project?.propertyCategory}
        onAdded={() => { fetchUnits(); fetchTowers(); }}
      />

      <AddTowerModal
        isOpen={isAddTowerModalOpen}
        onClose={() => setIsAddTowerModalOpen(false)}
        projectId={projectId}
        onAdded={fetchTowers}
      />
    </div>
  );
}

