'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { reraService } from '@/app/services/reraService';
import { toast } from 'react-hot-toast';

interface ImportReraPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ImportReraPropertyModal({ isOpen, onClose, onSuccess }: ImportReraPropertyModalProps) {
    const { token, user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [importingId, setImportingId] = useState<string | null>(null);
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

    const states = ['Maharashtra', 'Rajasthan']; // Supported states by scrapers

    const fetchProjects = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await reraService.getProjects(token, selectedState, selectedDistrict, searchQuery, 20);
            setProjects(data);
        } catch (error) {
            console.error('Failed to fetch RERA projects:', error);
            toast.error('Failed to load RERA projects');
        } finally {
            setLoading(false);
        }
    }, [token, selectedState, selectedDistrict, searchQuery]);

    useEffect(() => {
        const fetchDistricts = async () => {
            if (!token || !selectedState) {
                setAvailableDistricts([]);
                setSelectedDistrict('');
                return;
            }
            try {
                const districts = await reraService.getDistricts(token, selectedState);
                setAvailableDistricts(districts);
                setSelectedDistrict(''); // Reset district when state changes
            } catch (error) {
                console.error('Failed to fetch districts:', error);
            }
        };
        fetchDistricts();
    }, [token, selectedState]);

    useEffect(() => {
        if (isOpen) {
            fetchProjects();
        }
    }, [isOpen, fetchProjects]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProjects();
    };

    const handleImport = async (projectId: string) => {
        if (!token) return;
        setImportingId(projectId);
        try {
            await reraService.importProject(token, projectId);
            toast.success('Project imported successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to import RERA project:', error);
            toast.error(error.message || 'Failed to import project');
        } finally {
            setImportingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 md:left-64 z-[100] flex items-center justify-center p-4 sm:p-8 lg:p-12 animate-in fade-in duration-300">
            {/* Context-aware Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-md pointer-events-auto"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-5xl max-h-[85vh] flex flex-col bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden border border-white/50 animate-in zoom-in-95 duration-500 ring-1 ring-black/5">
                {/* Header */}
                <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-start bg-white/50 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Import Verified Project</h3>
                        </div>
                        <p className="text-gray-500 font-medium ml-13">Direct access to the official RERA database with verified credentials</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all duration-300 group"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                    {/* Search & Filters */}
                    <div className="px-10 py-8 border-b border-gray-100 bg-white relative z-0">
                        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-5">
                            <div className="flex-1 relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search by project, RERA No, or promoter..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4.5 bg-gray-50 border border-transparent rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-base font-medium transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                                <div className="lg:w-48 relative">
                                    <select
                                        value={selectedState}
                                        onChange={(e) => setSelectedState(e.target.value)}
                                        className="w-full pl-5 pr-12 py-4.5 bg-gray-50 border border-transparent rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm font-bold appearance-none cursor-pointer transition-all uppercase tracking-wider"
                                    >
                                        <option value="">ALL STATES</option>
                                        {states.map(state => (
                                            <option key={state} value={state}>{state.toUpperCase()}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                                <div className="lg:w-48 relative">
                                    <select
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                        disabled={!selectedState}
                                        className="w-full pl-5 pr-12 py-4.5 bg-gray-50 border border-transparent rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm font-bold appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
                                    >
                                        <option value="">CITY</option>
                                        {availableDistricts.map(district => (
                                            <option key={district} value={district}>{district.toUpperCase()}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-10 py-4.5 rounded-[1.25rem] font-black text-sm uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-2xl shadow-blue-500/30"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Results */}
                    <div className="max-h-[60vh] overflow-y-auto p-8 bg-gray-50/20">
                        {loading ? (
                            <div className="py-24 text-center">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                                <p className="text-gray-900 font-bold text-lg">Searching RERA database</p>
                                <p className="text-gray-400 text-sm mt-1">This may take a moment while we fetch the latest data...</p>
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="py-24 text-center">
                                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-gray-200/50 flex items-center justify-center mx-auto mb-6 border border-gray-100 animate-bounce-subtle">
                                    <svg className="w-12 h-12 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012-2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h4 className="text-2xl font-black text-gray-900 mb-2">No projects found</h4>
                                <p className="text-gray-500 max-w-sm mx-auto text-base">
                                    Try adjusting your search terms or filters. If you still can't find it, the project might not be in our current cache.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5">
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="bg-white border border-gray-100 rounded-[1.5rem] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-blue-400/30 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-300 group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <h4 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors text-lg uppercase tracking-tight">{project.projectName}</h4>
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ring-blue-100">
                                                        {project.state}
                                                    </span>
                                                    {project.district && (
                                                        <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                                                            {project.district}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-gray-500 font-bold flex items-center gap-2 mb-4">
                                                <span className="w-8 h-[2px] bg-blue-100"></span>
                                                {project.promoterName}
                                            </p>
                                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">RERA Number</span>
                                                    <span className="font-mono text-sm font-bold text-gray-900">{project.reraNumber}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</span>
                                                    <span className="text-sm font-bold text-gray-900">{project.district}, {project.state}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 w-full md:w-auto">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleImport(project.id);
                                                }}
                                                disabled={importingId === project.id}
                                                className={`relative z-10 w-full md:w-auto px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 ${importingId === project.id
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-slate-900 text-white hover:bg-black hover:translate-y-[-2px] active:translate-y-0 shadow-xl shadow-slate-200'
                                                    }`}
                                            >
                                                {importingId === project.id ? (
                                                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                )}
                                                {importingId === project.id ? 'IMPORTING...' : 'IMPORT PROJECT'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 border-t border-gray-100 bg-white/50 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 text-gray-500 font-black text-sm hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all uppercase tracking-widest"
                        >
                            Close Window
                        </button>
                    </div>
            </div>
        </div>
    );
}
