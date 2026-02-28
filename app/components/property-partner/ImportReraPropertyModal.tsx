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
            toast.success('Project imported successfully as draft');
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
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                />

                <div className="relative overflow-hidden rounded-2xl bg-white text-left shadow-2xl sm:my-8 sm:w-full sm:max-w-5xl">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Import Verified Project</h3>
                            <p className="text-sm text-gray-500">Search and import verified projects from the RERA database</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Search & Filters */}
                    <div className="p-6 border-b border-gray-100">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search by project name, RERA number, or promoter..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                                <div className="md:w-44">
                                    <select
                                        value={selectedState}
                                        onChange={(e) => setSelectedState(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm appearance-none bg-white cursor-pointer"
                                    >
                                        <option value="">Select State</option>
                                        {states.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:w-44">
                                    <select
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                        disabled={!selectedState}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm appearance-none bg-white cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
                                    >
                                        <option value="">Select City</option>
                                        {availableDistricts.map(district => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md shadow-blue-100"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Results */}
                    <div className="max-h-[60vh] overflow-y-auto p-6 bg-gray-50/30">
                        {loading ? (
                            <div className="py-20 text-center">
                                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-500 font-medium">Searching RERA database...</p>
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="py-20 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-1">No projects found</h4>
                                <p className="text-gray-500 max-w-xs mx-auto text-sm">We couldn't find any projects matching your search criteria in our RERA cache.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-200 hover:shadow-lg transition-all group"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase">{project.projectName}</h4>
                                                <div className="flex gap-1">
                                                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ring-blue-100">
                                                        {project.state}
                                                    </span>
                                                    {project.district && (
                                                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ring-amber-100">
                                                            {project.district}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 font-medium mb-2">{project.promoterName}</p>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-gray-500 tracking-tighter">RERA NO:</span>
                                                    <span className="font-mono text-gray-400">{project.reraNumber}</span>
                                                </div>
                                                {project.district && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-bold text-gray-500 tracking-tighter">DISTRICT:</span>
                                                        <span>{project.district}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 w-full md:w-auto">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleImport(project.id);
                                                }}
                                                disabled={importingId === project.id}
                                                className={`relative z-10 w-full md:w-auto px-6 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${importingId === project.id
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200'
                                                    }`}
                                            >
                                                {importingId === project.id ? (
                                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                )}
                                                {importingId === project.id ? 'Importing...' : 'Import Project'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
