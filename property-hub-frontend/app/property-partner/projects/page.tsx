'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Property, PropertyStatus, PropertyCategory } from '@/app/types/property';
import { PROPERTY_STATUS_CONFIG, PROPERTY_TYPES } from '@/app/constants/property';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import AddProjectModal from '@/app/components/property-partner/AddProjectModal';
import SelectProjectModal from '@/app/components/property-partner/SelectProjectModal';
import ViewListingModal from '@/app/components/property-partner/ViewListingModal';
import ImportReraPropertyModal from '@/app/components/property-partner/ImportReraPropertyModal';
import MarkAsSoldModal from '@/app/components/property-partner/MarkAsSoldModal';
import SubmitBankApprovalModal from '@/app/components/property-partner/SubmitBankApprovalModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102';

type FilterStatus = PropertyStatus | 'all';

const CATEGORY_CONFIG: Record<PropertyCategory, { label: string; color: string; bgColor: string }> = {
  flat: { label: 'Flat', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  plot: { label: 'Plot', color: 'text-green-700', bgColor: 'bg-green-100' },
  shop: { label: 'Shop', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  villa: { label: 'Villa', color: 'text-pink-700', bgColor: 'bg-pink-100' },
  office: { label: 'Office', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  warehouse: { label: 'Warehouse', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

export default function ProjectsPage() {
  const { token } = useAuth();
  const { activeContext } = useUnifiedApp();

  const [projects, setProjects] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    draft: 0,
    approved: 0,
    under_construction: 0,
    rejected: 0,
    submitted: 0
  });
  const PROJECTS_PER_PAGE = 8;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isViewListingModalOpen, setIsViewListingModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMarkAsSoldModalOpen, setIsMarkAsSoldModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProjectForView, setSelectedProjectForView] = useState<Property | null>(null);
  const [selectedProjectForSale, setSelectedProjectForSale] = useState<Property | null>(null);

  const fetchProjects = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: PROJECTS_PER_PAGE.toString(),
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (filterStatus !== 'all') params.append('status', filterStatus.toUpperCase());

      const res = await fetch(`${API_URL}/api/projects/my?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const responseData = await res.json();
        const projectsList = Array.isArray(responseData) ? responseData : (responseData.data || []);
        
        const mapped: Property[] = projectsList.map((p: any) => {
          const backendStatus = p.status?.toUpperCase();
          let frontendStatus: PropertyStatus = 'draft';

          switch (backendStatus) {
            case 'DRAFT': frontendStatus = 'draft'; break;
            case 'SUBMITTED': frontendStatus = 'submitted'; break;
            case 'APPROVED': frontendStatus = 'approved'; break;
            case 'REJECTED': frontendStatus = 'rejected'; break;
            case 'UNDER_CONSTRUCTION': frontendStatus = 'under_construction'; break;
            default: frontendStatus = 'draft';
          }

          let description = p.description || '';
          let amenities: string[] = [];
          if (description.includes('Amenities:')) {
            const parts = description.split('Amenities:');
            description = parts[0].trim();
            amenities = parts[1].split(',').map((a: string) => a.trim());
          }

          // Extract city and state, handling both string and object formats from API
          const cityName = p.cityName || (p.locationRel?.city ? (typeof p.locationRel.city === 'object' ? p.locationRel.city.name : p.locationRel.city) : (typeof p.city === 'object' && p.city?.name ? p.city.name : (p.city || '')));
          const stateName = p.state || (p.locationRel?.state ? (typeof p.locationRel.state === 'object' ? p.locationRel.state.name : p.locationRel.state) : (typeof p.state === 'object' && p.state?.name ? p.state.name : (p.state || '')));

          return {
            id: p.id,
            title: p.name,
            projectType: p.projectType === 'COMMERCIAL' ? 'commercial' : 'residential',
            propertyCategory: p.category?.toLowerCase() as any,
            location: p.location,
            address: p.address || '',
            city: cityName,
            state: stateName,
            pincode: p.pincode || '',
            totalArea: parseFloat(p.area) || 0,
            totalTowers: p.totalTowers || 0,
            totalUnits: p.totalUnits || 0,
            startingPrice: parseFloat(p.price) || 0,
            description: description,
            amenities: amenities,
            status: frontendStatus,
            createdAt: new Date(p.createdAt),

            continent: p.locationRel?.continent || p.continent || '',
            country: p.locationRel?.country || p.country || '',
            buyerName: p.buyerName,
            buyerPhone: p.buyerPhone,
            salePrice: parseFloat(p.salePrice) || 0,
            soldAt: p.soldAt ? new Date(p.soldAt) : undefined,
            onboardingStep: p.onboardingStep || 1,
          };
        });

        setProjects(mapped);
        setTotalCount(responseData.total || mapped.length);
        if (responseData.stats) {
          const stats = responseData.stats;
          setStatusCounts({
            total: Object.values(stats).reduce((a: any, b: any) => a + b, 0) as number,
            draft: stats.draft || 0,
            approved: stats.approved || 0,
            under_construction: stats.under_construction || 0,
            rejected: stats.rejected || 0,
            submitted: stats.submitted || 0
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 500);
    return () => clearTimeout(timer);
  }, [token, currentPage, filterStatus, searchQuery]);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery]);

  const handleAddProject = () => {
    setEditingId(null);
    setIsAddModalOpen(true);
  };

  const handleEditProject = (id: string) => {
    setEditingId(id);
    setIsAddModalOpen(true);
  };

  const handleViewListingData = (project: Property) => {
    setSelectedProjectForView(project);
    setIsViewListingModalOpen(true);
  };

  const handleListProject = () => {
    setIsSelectModalOpen(true);
  };

  const handleMarkAsSold = (project: Property) => {
    setSelectedProjectForSale(project);
    setIsMarkAsSoldModalOpen(true);
  };

  if (loading && projects.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Loading projects...
      </div>
    );
  }

  const filteredProjects = projects; // Filtering now happens on the server

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects Portfolio</h1>
          <p className="text-gray-600 mt-1">Manage your internal inventory and public listings</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleListProject}
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
            onClick={handleAddProject}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-bold transition flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Project
          </button>
        </div>
      </div>

      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        editId={editingId}
        onSuccess={fetchProjects}
      />

      <SelectProjectModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        onSuccess={fetchProjects}
      />

      <MarkAsSoldModal
        isOpen={isMarkAsSoldModalOpen}
        onClose={() => {
          setIsMarkAsSoldModalOpen(false);
          setSelectedProjectForSale(null);
        }}
        projectId={selectedProjectForSale?.id}
        onSold={fetchProjects}
      />


      <ViewListingModal
        isOpen={isViewListingModalOpen}
        onClose={() => {
          setIsViewListingModalOpen(false);
          setSelectedProjectForView(null);
        }}
        property={selectedProjectForView}
      />

      <ImportReraPropertyModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchProjects}
      />



      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', count: statusCounts.total, color: 'text-gray-900', bgColor: 'bg-white' },
          { label: 'Draft', count: statusCounts.draft, color: 'text-gray-600', bgColor: 'bg-white' },
          { label: 'Approved', count: statusCounts.approved, color: 'text-blue-600', bgColor: 'bg-white' },
          { label: 'Under Construction', count: statusCounts.under_construction, color: 'text-amber-600', bgColor: 'bg-white' },
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
            {['all', 'draft', 'approved', 'under_construction'].map((status) => (
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

      {/* Projects List/Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012-2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your search or filters to find what you are looking for.'
              : 'Your project portfolio is empty. Add your first project or list existing ones to the public directory.'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project Details</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type & Category</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProjects.map(project => {
                const statusConfig = PROPERTY_STATUS_CONFIG[project.status];
                const isDraft = project.status === 'draft';
                const canMarkAsSold = ['draft', 'approved'].includes(project.status);
                const hasListingData = ['submitted', 'approved', 'rejected'].includes(project.status);

                return (
                  <tr key={project.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{project.title}</p>
                        <p className="text-xs font-semibold text-blue-600 mt-0.5">₹{(project.startingPrice / 100000).toFixed(1)}L+</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{project.location}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ring-1 ring-inset ${statusConfig?.bgColor || 'bg-gray-100'} ${statusConfig?.color || 'text-gray-600'} ${statusConfig?.ringColor || 'ring-gray-200'}`}>
                        {statusConfig?.label || project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 capitalize">{project.propertyType || (project as any).projectType}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        {project.propertyCategory && CATEGORY_CONFIG[project.propertyCategory] ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${CATEGORY_CONFIG[project.propertyCategory].bgColor} ${CATEGORY_CONFIG[project.propertyCategory].color}`}>
                            {CATEGORY_CONFIG[project.propertyCategory].label}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Regular</span>
                        )}
                        {project.onboardingStep && project.onboardingStep < 5 && project.status === 'draft' && (
                          <div className="flex flex-col gap-1 min-w-[100px]">
                            <div className="flex justify-between text-[9px] font-bold text-amber-600">
                              <span>PROGRESS</span>
                              <span>{Math.round((project.onboardingStep / 6) * 100)}%</span>
                            </div>
                            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                style={{ width: `${(project.onboardingStep / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">

                        {hasListingData && (
                          <button
                            onClick={() => handleViewListingData(project)}
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
                            onClick={() => handleMarkAsSold(project)}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Mark as Sold"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        <Link
                          href={`/dashboard/projects/${project.id}`}
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
          {filteredProjects.map(project => {
            const statusConfig = PROPERTY_STATUS_CONFIG[project.status];
            const isDraft = project.status === 'draft';
            const canMarkAsSold = ['draft', 'approved'].includes(project.status);
            const hasListingData = ['submitted', 'approved', 'rejected'].includes(project.status);

            return (
              <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative aspect-video bg-gray-100">
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                      <svg className="w-12 h-12 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m-4 4l-4-4m9-5l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ${statusConfig?.bgColor || 'bg-white'} ${statusConfig?.color || 'text-gray-900'} ${statusConfig?.ringColor || 'ring-gray-200'}`}>
                      {statusConfig?.label || project.status}
                    </span>
                  </div>

                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 truncate pr-4">{project.title}</h3>
                    <p className="text-sm font-black text-blue-600">₹{(project.startingPrice / 100000).toFixed(1)}L+</p>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {project.location}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{project.propertyType || (project as any).projectType}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                    {project.propertyCategory && CATEGORY_CONFIG[project.propertyCategory] && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${CATEGORY_CONFIG[project.propertyCategory].bgColor} ${CATEGORY_CONFIG[project.propertyCategory].color}`}>
                        {CATEGORY_CONFIG[project.propertyCategory].label}
                      </span>
                    )}
                  </div>


                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex gap-2">
                      {hasListingData && (
                        <button
                          onClick={() => handleViewListingData(project)}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                        >
                          Listing Data
                        </button>
                      )}
                      {canMarkAsSold && (
                        <button
                          onClick={() => handleMarkAsSold(project)}
                          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
                        >
                          Mark Sold
                        </button>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/projects/${project.id}`}
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

      {totalCount > PROJECTS_PER_PAGE && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-gray-100 shadow-sm mt-6">
          <p className="text-sm text-gray-500 font-medium tracking-tight">
            Showing <span className="text-gray-900 font-bold">{(currentPage - 1) * PROJECTS_PER_PAGE + 1}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * PROJECTS_PER_PAGE, totalCount)}</span> of <span className="text-gray-900 font-bold">{totalCount}</span> projects
          </p>
          <div className="flex gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-5 py-2.5 border-2 border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            >
              Previous
            </button>
            <button
              disabled={currentPage * PROJECTS_PER_PAGE >= totalCount}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-30 disabled:bg-blue-400 disabled:shadow-none"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
