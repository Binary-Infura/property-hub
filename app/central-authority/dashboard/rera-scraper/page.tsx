'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { reraService } from '@/app/services/reraService';
import { useRouter } from 'next/navigation';

interface ReraProject {
    id: string;
    state: string;
    reraNumber: string;
    projectName: string;
    promoterName: string;
    status: string;
    district: string;
    address: string;
    registrationDate: string;
    completionDate: string;
    updatedAt: string;
}

interface ScraperState {
    name: string;
    id: string;
    description: string;
    lastSync?: string;
    status: 'idle' | 'syncing' | 'completed' | 'error';
    processedCount?: number;
    error?: string;
    projects: ReraProject[];
    availableDistricts: string[];
    selectedDistrict: string;
}

export default function ReraScraperPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [states, setStates] = useState<ScraperState[]>([
        {
            id: 'rajasthan',
            name: 'Rajasthan',
            description: 'Scrapes registered projects from Rajasthan RERA (rera.rajasthan.gov.in)',
            status: 'idle',
            projects: [],
            availableDistricts: ['Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Hanumangarh', 'Jaipur', 'Jaisalmer', 'Jalor', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Kota', 'Nagaur', 'Pali', 'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'],
            selectedDistrict: ''
        },
        {
            id: 'maharashtra',
            name: 'Maharashtra',
            description: 'Scrapes registered projects from MahaRERA (maharera.maharashtra.gov.in)',
            status: 'idle',
            projects: [],
            availableDistricts: ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondiya', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigarh', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'],
            selectedDistrict: ''
        }
    ]);
    const [globalSyncing, setGlobalSyncing] = useState(false);
    const [activeTab, setActiveTab] = useState<'status' | 'data'>('status');
    const [selectedViewStateId, setSelectedViewStateId] = useState('rajasthan');
    const [selectedViewDistrict, setSelectedViewDistrict] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [portalCount, setPortalCount] = useState<number | null>(null);
    const [fetchingCount, setFetchingCount] = useState(false);
    const RECORDS_PER_PAGE = 10;

    const fetchStateProjects = async (stateId: string) => {
        if (!token) return;
        try {
            const projects = await reraService.getProjects(token, stateId);
            setStates(current =>
                current.map(s => s.id.toLowerCase() === stateId.toLowerCase() ? { ...s, projects } : s)
            );
        } catch (error) {
            console.error(`Failed to fetch projects for ${stateId}`, error);
        }
    };

    useEffect(() => {
        if (token) {
            states.forEach(state => fetchStateProjects(state.id));
        }
    }, [token]);

    const handleSyncState = async (stateId: string) => {
        if (!token) return;

        const stateObj = states.find(s => s.id === stateId);
        const district = stateObj?.selectedDistrict;

        setStates(current =>
            current.map(s => s.id === stateId ? { ...s, status: 'syncing', error: undefined } : s)
        );

        try {
            const result = await reraService.syncState(stateId, token, district);
            setStates(current =>
                current.map(s => s.id === stateId ? {
                    ...s,
                    status: 'completed',
                    processedCount: result.processed,
                    lastSync: new Date().toISOString()
                } : s)
            );
            // Refresh projects after sync
            await fetchStateProjects(stateId);
        } catch (error: any) {
            setStates(current =>
                current.map(s => s.id === stateId ? {
                    ...s,
                    status: 'error',
                    error: error.message || 'Scraping failed'
                } : s)
            );
        }
    };

    const handleSyncAll = async () => {
        if (!token) return;
        setGlobalSyncing(true);

        try {
            await reraService.syncAllStates(token);
            alert('Background sync jobs have been queued for all states.');
        } catch (error: any) {
            alert('Failed to trigger global sync: ' + error.message);
        } finally {
            setGlobalSyncing(false);
        }
    };

    const handleDistrictChange = (stateId: string, district: string) => {
        setStates(current =>
            current.map(s => s.id === stateId ? { ...s, selectedDistrict: district } : s)
        );
        // Reset portal count when district changes
        setPortalCount(null);
    };

    const fetchPortalCount = async (stateId: string, district?: string) => {
        if (!token) return;
        setFetchingCount(true);
        try {
            const count = await reraService.getTotalCount(token, stateId, district);
            setPortalCount(count);
        } catch (error) {
            console.error('Failed to fetch portal count', error);
        } finally {
            setFetchingCount(false);
        }
    };

    useEffect(() => {
        if (selectedState && selectedState.id === 'rajasthan' && activeTab === 'status') {
            fetchPortalCount('rajasthan', selectedState.selectedDistrict);
        }
    }, [selectedViewStateId, activeTab]);

    const selectedState = states.find(s => s.id === selectedViewStateId);
    const filteredProjects = selectedState?.projects.filter(p => {
        const matchesDistrict = !selectedViewDistrict ||
            p.district?.toLowerCase().trim() === selectedViewDistrict.toLowerCase().trim();

        const matchesSearch = !searchQuery ||
            p.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.promoterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.reraNumber?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesDistrict && matchesSearch;
    }) || [];

    const totalPages = Math.ceil(filteredProjects.length / RECORDS_PER_PAGE);
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * RECORDS_PER_PAGE,
        currentPage * RECORDS_PER_PAGE
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedViewStateId, selectedViewDistrict, searchQuery]);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">RERA Data Scraper</h1>
                    <p className="text-slate-500 mt-1">Manage and monitor real-time property data synchronization from state RERA portals.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleSyncAll}
                        disabled={globalSyncing}
                        className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md flex items-center gap-2"
                    >
                        {globalSyncing ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : '🔄'}
                        Sync All States
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('status')}
                    className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'status' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Scraper Status
                </button>
                <button
                    onClick={() => setActiveTab('data')}
                    className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'data' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Fetched Data
                </button>
            </div>

            {activeTab === 'status' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                    {/* State Selector for Status */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">State Scraper Control</h3>
                            <p className="text-xs text-slate-500">Select a state to manage its RERA synchronization</p>
                        </div>
                        <div className="w-64">
                            <select
                                value={selectedViewStateId}
                                onChange={(e) => {
                                    setSelectedViewStateId(e.target.value);
                                    setSelectedViewDistrict('');
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                            >
                                {states.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {selectedState && (
                        <div
                            key={selectedState.id}
                            className={`bg-white rounded-2xl border transition-all duration-300 ${selectedState.status === 'syncing' ? 'border-indigo-200 ring-4 ring-indigo-50 shadow-indigo-100' : 'border-slate-100 shadow-sm hover:shadow-md'
                                } p-6 overflow-hidden relative group`}
                        >
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{selectedState.name} RERA</h3>
                                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Project Scraper</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedState.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                        selectedState.status === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                            selectedState.status === 'syncing' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                                'bg-slate-50 text-slate-500 border border-slate-100'
                                        }`}>
                                        {selectedState.status}
                                    </div>
                                </div>

                                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                    {selectedState.description}
                                </p>

                                <div className="space-y-4 mb-8">
                                    {/* City selection */}
                                    <div>
                                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Target City (District)</label>
                                        <select
                                            value={selectedState.selectedDistrict}
                                            onChange={(e) => handleDistrictChange(selectedState.id, e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                                        >
                                            <option value="">All Rajasthan</option>
                                            {selectedState.availableDistricts.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Portal Count Display */}
                                    {selectedState.id === 'rajasthan' && (
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-0.5">Total Projects on Portal</div>
                                                <div className="text-xl font-extrabold text-slate-900">
                                                    {fetchingCount ? (
                                                        <div className="h-7 w-20 bg-slate-200 animate-pulse rounded" />
                                                    ) : portalCount !== null ? (
                                                        portalCount.toLocaleString()
                                                    ) : (
                                                        '---'
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => fetchPortalCount(selectedState.id, selectedState.selectedDistrict)}
                                                disabled={fetchingCount || selectedState.status === 'syncing'}
                                                className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 disabled:opacity-30"
                                                title="Refresh Count"
                                            >
                                                {fetchingCount ? (
                                                    <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                                                ) : '🔄'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between text-xs py-2 border-b border-slate-50">
                                    <span className="text-slate-400">Total Scraped</span>
                                    <span className="text-slate-700 font-semibold">{selectedState.projects.length} Projects</span>
                                </div>
                                <div className="flex justify-between text-xs py-2 border-b border-slate-50">
                                    <span className="text-slate-400">Last Sync</span>
                                    <span className="text-slate-700 font-semibold">
                                        {selectedState.lastSync ? new Date(selectedState.lastSync).toLocaleString() : 'Never'}
                                    </span>
                                </div>
                                {selectedState.error && (
                                    <div className="p-3 bg-rose-50 rounded-lg text-[11px] text-rose-600 border border-rose-100 font-medium font-mono whitespace-pre-wrap">
                                        ⚠️ {selectedState.error}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleSyncState(selectedState.id)}
                                disabled={selectedState.status === 'syncing'}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${selectedState.status === 'syncing'
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-95'
                                    }`}
                            >
                                {selectedState.status === 'syncing' ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                        Fetching Data...
                                    </>
                                ) : (
                                    <>
                                        <span className="text-lg">⚡</span> Start Scrapping
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Filter Controls */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Select State</label>
                                <select
                                    value={selectedViewStateId}
                                    onChange={(e) => {
                                        setSelectedViewStateId(e.target.value);
                                        setSelectedViewDistrict(''); // Reset district when state changes
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                                >
                                    {states.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Filter by City/District</label>
                                <select
                                    value={selectedViewDistrict}
                                    onChange={(e) => setSelectedViewDistrict(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                                >
                                    <option value="">All Cities</option>
                                    {selectedState?.availableDistricts.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Search Projects</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by Project Name, Promoter, or RERA Number..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">{selectedState?.name} Projects</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 bg-white rounded-md border border-slate-200 text-slate-500 font-medium">
                                    {filteredProjects.length} {selectedViewDistrict ? `in ${selectedViewDistrict}` : 'Total'}
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-[10px] uppercase tracking-widest font-black text-slate-400 bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-3">Project Name</th>
                                        <th className="px-6 py-3">RERA Number</th>
                                        <th className="px-6 py-3">District</th>
                                        <th className="px-3 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Last Updated</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginatedProjects.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">
                                                No projects found for the selected filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedProjects.map((project) => (
                                            <tr key={project.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{project.projectName}</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">{project.promoterName}</div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-600 bg-slate-50/50">
                                                    {project.reraNumber}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    {project.district || 'N/A'}
                                                </td>
                                                <td className="px-3 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${project.status?.toLowerCase().includes('complete') ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                        }`}>
                                                        {project.status || 'Unknown'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-400 text-[10px] font-medium">
                                                    {new Date(project.updatedAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Pagination UI */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                <div className="text-xs text-slate-500 font-medium">
                                    Showing <span className="text-slate-900">{(currentPage - 1) * RECORDS_PER_PAGE + 1}</span> to <span className="text-slate-900">{Math.min(currentPage * RECORDS_PER_PAGE, filteredProjects.length)}</span> of <span className="text-slate-900">{filteredProjects.length}</span> results
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => {
                                            const pageNum = i + 1;
                                            // Only show current, first, last, and neighbors
                                            if (
                                                pageNum === 1 ||
                                                pageNum === totalPages ||
                                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
                                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                                            : 'text-slate-500 hover:bg-slate-100'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            } else if (
                                                pageNum === currentPage - 2 ||
                                                pageNum === currentPage + 2
                                            ) {
                                                return <span key={pageNum} className="text-slate-400 text-xs px-1">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                )}
                    </div>

                    {/* Scheduler Info */}
                    <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full -mr-20 -mt-20 opacity-50" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-800 rounded-full -ml-16 -mb-16 opacity-30" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm border border-white/10">
                                🤖
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-bold mb-2">Automated Synchronization</h2>
                                <p className="text-indigo-200 text-sm max-w-2xl leading-relaxed">
                                    The system is configured to automatically run these scrapers every 24 hours at midnight.
                                    Manual triggers are recommended only when immediate updates are required for specific regional analysis.
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-300 mb-2">Scheduler Status</span>
                                <div className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                    ACTIVE
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
};

            export default ReraScraperPage;
