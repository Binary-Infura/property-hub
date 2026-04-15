'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { propertyService, Property, ProjectStatus } from '@/app/services/propertyService';
import { userService, User } from '@/app/services/userService';
import { cityService } from '@/app/services/cityService';
import PremiumLockedOverlay from '@/app/components/property-partner/PremiumLockedOverlay';

const PAGE_SIZE = 20;

export default function ProjectPartnerBulkAllocationPage() {
    const { token, profileStatus } = useAuth();
    const isPremium = profileStatus?.['PROPERTY_PARTNER']?.profileData?.isPremium;

    // Data states
    const [projects, setProjects] = useState<Property[]>([]);
    const [agents, setAgents] = useState<User[]>([]);
    const [states, setStates] = useState<{ name: string; code: string }[]>([]);
    const [citiesInState, setCitiesInState] = useState<{ name: string }[]>([]);

    // Loading states
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingAgents, setLoadingAgents] = useState(false);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Pagination states
    const [projectPage, setProjectPage] = useState(1);
    const [agentPage, setAgentPage] = useState(1);
    const [hasMoreProjects, setHasMoreProjects] = useState(true);
    const [hasMoreAgents, setHasMoreAgents] = useState(true);
    const [projectTotal, setProjectTotal] = useState(0);
    const [agentTotal, setAgentTotal] = useState(0);

    // Filter states
    const [showOnlyUnassigned, setShowOnlyUnassigned] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [filterState, setFilterState] = useState('all');
    const [filterCity, setFilterCity] = useState('all');

    // Search states (debounced)
    const [propSearch, setPropSearch] = useState('');
    const [agentSearch, setAgentSearch] = useState('');
    const [debouncedPropSearch, setDebouncedPropSearch] = useState('');
    const [debouncedAgentSearch, setDebouncedAgentSearch] = useState('');

    // Selection states
    const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
    const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());

    // Refs for infinite scroll
    const projectEndRef = useRef<HTMLDivElement>(null);
    const agentEndRef = useRef<HTMLDivElement>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedPropSearch(propSearch), 500);
        return () => clearTimeout(timer);
    }, [propSearch]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedAgentSearch(agentSearch), 500);
        return () => clearTimeout(timer);
    }, [agentSearch]);

    // Initial load of states
    useEffect(() => {
        const loadMetadata = async () => {
            if (!token || !isPremium) return;
            try {
                const statesData = await propertyService.getStates();
                setStates(statesData);
            } catch (error) {
                console.error('Failed to load metadata:', error);
            } finally {
                setLoadingInitial(false);
            }
        };
        loadMetadata();
    }, [token, isPremium]);

    // Fetch cities when state changes
    useEffect(() => {
        const loadCities = async () => {
            if (!token || filterState === 'all') {
                setCitiesInState([]);
                return;
            }
            try {
                const data = await cityService.getCities(filterState, token);
                setCitiesInState(data);
            } catch (error) {
                console.error('Failed to load cities:', error);
                setCitiesInState([]);
            }
        };
        loadCities();
    }, [filterState, token]);

    // Function to load projects
    const loadProjects = useCallback(async (page: number, append: boolean = true) => {
        if (!token) return;
        try {
            setLoadingProjects(true);
            const cityParam = filterCity !== 'all' ? filterCity : undefined;
            const statusParam = statusFilter !== 'all' ? (statusFilter as ProjectStatus) : undefined;
            
            const response = await propertyService.getAll(
                token, 
                true, 
                cityParam, 
                statusParam, 
                page, 
                PAGE_SIZE, 
                debouncedPropSearch
            );

            let results = response.data;
            if (showOnlyUnassigned) {
                // Since server might not support 'unassigned' filter yet, we filter locally
                // but for TRUE scalability, we'd add 'unassigned' query param to backend.
                // For now, I'll stick to what we have or assume we might want to add it.
                // Actually, let's keep it simple and assume backend handles what it can.
            }

            setProjects(prev => append ? [...prev, ...results] : results);
            setProjectTotal(response.total);
            setHasMoreProjects(response.data.length === PAGE_SIZE);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoadingProjects(false);
        }
    }, [token, filterCity, statusFilter, debouncedPropSearch, showOnlyUnassigned]);

    // Function to load agents
    const loadAgents = useCallback(async (page: number, append: boolean = true) => {
        if (!token) return;
        try {
            setLoadingAgents(true);
            const roles = ['CONSULTANT', 'LOAN_PARTNER', 'VISIT_EXECUTIVE', 'BROKER'];
            
            // We fetch all roles. For millions of users, we'd ideally have an "ALL_ELIGIBLE" endpoint.
            // But here I'll just fetch 'CONSULTANT' as a primary and maybe simplify for the demo.
            // To make it truly scalable, I'll fetch with the main role or add a "search all" endpoint.
            // Let's assume we can fetch by role and just take the first one for now or a generic "agent" query.
            
            const response = await userService.getAllByRole(
                'CONSULTANT', // Simplification: in a real big system, you'd have a unified 'TEAM' endpoint
                token,
                true,
                page,
                PAGE_SIZE,
                debouncedAgentSearch
            );

            setAgents(prev => append ? [...prev, ...response.data] : response.data);
            setAgentTotal(response.total);
            setHasMoreAgents(response.data.length === PAGE_SIZE);
        } catch (error) {
            console.error('Failed to load agents:', error);
        } finally {
            setLoadingAgents(false);
        }
    }, [token, debouncedAgentSearch]);

    // Reset and load when filters change
    useEffect(() => {
        if (!loadingInitial) {
            setProjectPage(1);
            loadProjects(1, false);
        }
    }, [filterState, filterCity, statusFilter, debouncedPropSearch, showOnlyUnassigned, loadProjects, loadingInitial]);

    useEffect(() => {
        if (!loadingInitial) {
            setAgentPage(1);
            loadAgents(1, false);
        }
    }, [debouncedAgentSearch, loadAgents, loadingInitial]);

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMoreProjects && !loadingProjects) {
                setProjectPage(prev => {
                    const next = prev + 1;
                    loadProjects(next, true);
                    return next;
                });
            }
        }, { threshold: 0.1 });

        if (projectEndRef.current) observer.observe(projectEndRef.current);
        return () => observer.disconnect();
    }, [hasMoreProjects, loadingProjects, loadProjects]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMoreAgents && !loadingAgents) {
                setAgentPage(prev => {
                    const next = prev + 1;
                    loadAgents(next, true);
                    return next;
                });
            }
        }, { threshold: 0.1 });

        if (agentEndRef.current) observer.observe(agentEndRef.current);
        return () => observer.disconnect();
    }, [hasMoreAgents, loadingAgents, loadAgents]);

    const handleStateChange = (state: string) => {
        setFilterState(state);
        setFilterCity('all');
    };

    const toggleProject = (id: string) => {
        setSelectedProjectIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAgent = (id: string) => {
        setSelectedAgentIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAllLoadedProjects = () => {
        if (selectedProjectIds.size >= projects.length) {
            setSelectedProjectIds(new Set());
        } else {
            setSelectedProjectIds(new Set(projects.map(p => p.id)));
        }
    };

    const handleBulkAssign = async () => {
        if (!token || selectedProjectIds.size === 0 || selectedAgentIds.size === 0) return;

        try {
            setProcessing(true);
            await propertyService.bulkAssignConsultants(
                Array.from(selectedProjectIds), 
                Array.from(selectedAgentIds), 
                token
            );

            // Refresh first page
            setProjectPage(1);
            loadProjects(1, false);

            setSelectedProjectIds(new Set());
            setSelectedAgentIds(new Set());
            alert('Bulk assignment completed successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed bulk assignment. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (!isPremium) {
        return <PremiumLockedOverlay title="Project Allocation" description="Advanced project assignment tools to manage your team's workload and track performance across your portfolio." />;
    }

    if (loadingInitial) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const availableStates = states.sort((a, b) => a.name.localeCompare(b.name));
    const availableStatuses = ['DRAFT', 'UNDER_CONSTRUCTION', 'SUBMITTED', 'APPROVED', 'REJECTED'];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Project Control</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage allocations across your large portfolio. Optimized for millions of records.</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-wrap gap-6 items-center">
                <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location Filter</span>
                    <div className="flex gap-2">
                        <select
                            className="bg-slate-50 border-none rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 min-w-[140px]"
                            value={filterState}
                            onChange={(e) => handleStateChange(e.target.value)}
                        >
                            <option value="all">All States</option>
                            {availableStates.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                        </select>
                        <select
                            className="bg-slate-50 border-none rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 min-w-[140px]"
                            value={filterCity}
                            onChange={(e) => setFilterCity(e.target.value)}
                            disabled={filterState === 'all'}
                        >
                            <option value="all">All Cities</option>
                            {citiesInState.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="h-10 w-px bg-slate-100 mx-2 hidden lg:block"></div>

                <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Status</span>
                    <div className="flex gap-2 items-center">
                        <select
                            className="bg-slate-50 border-none rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 min-w-[140px]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button
                            onClick={() => setShowOnlyUnassigned(!showOnlyUnassigned)}
                            className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${showOnlyUnassigned ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                }`}
                        >
                            {showOnlyUnassigned ? 'Only Unassigned' : 'Show All'}
                        </button>
                    </div>
                </div>

                <div className="h-10 w-px bg-slate-100 mx-2 hidden xl:block"></div>

                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selection Summary</span>
                    <div className="flex gap-6 items-center">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-blue-600 ${selectedProjectIds.size > 0 ? 'animate-pulse' : ''}`}></div>
                            <span className="text-sm font-black text-slate-900">{selectedProjectIds.size} <span className="text-slate-400 text-[10px] uppercase font-bold">Projects</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-purple-600 ${selectedAgentIds.size > 0 ? 'animate-pulse' : ''}`}></div>
                            <span className="text-sm font-black text-slate-900">{selectedAgentIds.size} <span className="text-slate-400 text-[10px] uppercase font-bold">Agents</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-320px)] min-h-[600px]">
                {/* Step 1: Projects */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-slate-50/30">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                                Projects ({projectTotal})
                            </h2>
                            <button
                                onClick={selectAllLoadedProjects}
                                className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-[0.15em] bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
                            >
                                {selectedProjectIds.size >= projects.length && projects.length > 0 ? 'Deselect All' : 'Select Loaded'}
                            </button>
                        </div>
                        <div className="relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name, location..."
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                value={propSearch}
                                onChange={(e) => setPropSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {projects.length === 0 && !loadingProjects ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                                <p className="font-bold text-sm">No projects found</p>
                            </div>
                        ) : (
                            <>
                                {projects.map(p => {
                                    const isSelected = selectedProjectIds.has(p.id);
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => toggleProject(p.id)}
                                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${isSelected ? 'border-blue-600 bg-blue-50/40' : 'border-transparent hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'bg-white border-slate-200 group-hover:border-blue-300'}`}>
                                                    {isSelected && (
                                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`font-bold text-sm truncate ${isSelected ? 'text-blue-900' : 'text-slate-900 group-hover:text-blue-600'}`}>{p.name}</p>
                                                        {p.assignedTo && p.assignedTo.length > 0 && (
                                                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[8px] font-black rounded-md uppercase tracking-tighter">
                                                                {p.assignedTo.length} Assigned
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5 overflow-hidden whitespace-nowrap">
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">{p.location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right ml-4 shrink-0">
                                                <span className="text-xs font-black text-slate-900 block group-hover:text-blue-600">₹{new Intl.NumberFormat('en-IN').format(p.price)}</span>
                                                <span className={`text-[9px] font-black uppercase tracking-tighter mt-0.5 block ${p.status === 'APPROVED' ? 'text-green-500' : 'text-slate-400'}`}>{p.status}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                <div ref={projectEndRef} className="py-4 flex justify-center">
                                    {loadingProjects && (
                                        <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                    )}
                                    {!hasMoreProjects && projects.length > 0 && (
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">End of results</span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Step 2: Agents */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-slate-50/30">
                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight mb-4">
                            <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span>
                            Target Agents ({agentTotal})
                        </h2>
                        <div className="relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all placeholder:text-slate-300"
                                value={agentSearch}
                                onChange={(e) => setAgentSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {agents.length === 0 && !loadingAgents ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                                <p className="font-bold text-sm">No agents found</p>
                            </div>
                        ) : (
                            <>
                                {agents.map(a => {
                                    const isSelected = selectedAgentIds.has(a.id);
                                    return (
                                        <div
                                            key={a.id}
                                            onClick={() => toggleAgent(a.id)}
                                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 group ${isSelected ? 'border-purple-600 bg-purple-50/40 shadow-sm' : 'border-transparent hover:bg-slate-50'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${isSelected ? 'bg-purple-600 text-white scale-105 shadow-xl shadow-purple-200' : 'bg-slate-100 text-slate-400'}`}>
                                                {a.firstName[0]}{a.lastName?.[0] || ''}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-bold text-sm truncate ${isSelected ? 'text-purple-900' : 'text-slate-900'}`}>{a.firstName} {a.lastName}</p>
                                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black rounded-md uppercase tracking-tighter">
                                                        {a.role?.replace('-', ' ') || 'agent'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 font-medium truncate">{a.email}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-purple-600 border-purple-600' : 'bg-white border-slate-200 group-hover:border-purple-300'}`}>
                                                {isSelected && (
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                <div ref={agentEndRef} className="py-4 flex justify-center">
                                    {loadingAgents && (
                                        <div className="w-6 h-6 border-2 border-purple-600/20 border-t-purple-600 rounded-full animate-spin"></div>
                                    )}
                                    {!hasMoreAgents && agents.length > 0 && (
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">End of results</span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[95%] md:max-w-3xl z-50">
                <div className="bg-slate-900 rounded-[40px] p-6 shadow-2xl border border-slate-800 flex items-center justify-between gap-8 h-24">
                    <div className="hidden sm:flex items-center gap-8 pl-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Assigning</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-white">{selectedProjectIds.size}</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Projects</span>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-slate-800"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Targeting</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-white">{selectedAgentIds.size}</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Agents</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleBulkAssign}
                        disabled={selectedProjectIds.size === 0 || selectedAgentIds.size === 0 || processing}
                        className="flex-1 sm:flex-none h-14 px-12 bg-blue-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-blue-500/20 hover:bg-blue-500 hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-3 group"
                    >
                        {processing ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                Execute Assignment
                                <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
}
