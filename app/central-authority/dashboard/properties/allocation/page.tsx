'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { propertyService, Property } from '@/app/services/propertyService';
import { userService, User } from '@/app/services/userService';
import { cityService, City } from '@/app/services/cityService';

export default function PropertyBulkAllocationPage() {
    const { token } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [agents, setAgents] = useState<User[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Filter Visibility Toggles
    const [showOnlyUnassigned, setShowOnlyUnassigned] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    // Centralized Filter States
    const [states, setStates] = useState<{ name: string; code: string }[]>([]);
    const [citiesInState, setCitiesInState] = useState<{ name: string }[]>([]);
    const [filterState, setFilterState] = useState('all'); // This will store the state code
    const [filterCity, setFilterCity] = useState('all');

    // Selection states
    const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
    const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

    // Search states (for individual columns)
    const [propSearch, setPropSearch] = useState('');
    const [agentSearch, setAgentSearch] = useState('');

    useEffect(() => {
        const loadInitialData = async () => {
            if (!token) return;
            try {
                setLoading(true);
                const [props, consultantsData, loanAdvisersData, visitExecutivesData, statesData] = await Promise.all([
                    propertyService.getAll(token),
                    userService.getAllByRole('consultant', token),
                    userService.getAllByRole('loan-adviser', token),
                    userService.getAllByRole('visit-executive', token),
                    cityService.getStates(token)
                ]);

                // Combine all eligible roles into one agents list with guaranteed role property
                const combined = [
                    ...consultantsData.data.map((u: User) => ({ ...u, role: u.role || 'consultant' })),
                    ...loanAdvisersData.data.map((u: User) => ({ ...u, role: u.role || 'loan-adviser' })),
                    ...visitExecutivesData.data.map((u: User) => ({ ...u, role: u.role || 'visit-executive' }))
                ];

                // De-duplicate by ID to avoid React key collisions if a user has multiple roles
                const allAgents = Array.from(new Map(combined.map(u => [u.id, u])).values());

                setProperties(props);
                setAgents(allAgents);
                setStates(statesData);
            } catch (error) {
                console.error('Failed to load initial allocation data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [token]);

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

    // Derive filter options - Robust version using global city data
    const availableStates = useMemo(() => {
        const combined = new Map<string, string>(); // code -> name
        states.forEach(s => combined.set(s.code, s.name));

        // Ensure states from existing properties are also included (just in case)
        properties.forEach(p => {
            if (p.city?.state) {
                // Try to find code for this state name if missing
                const entry = states.find(s => s.name === p.city?.state);
                if (entry) combined.set(entry.code, entry.name);
                else combined.set(p.city.state, p.city.state);
            }
        });

        return Array.from(combined.entries()).map(([code, name]) => ({ code, name })).sort((a, b) => a.name.localeCompare(b.name));
    }, [states, properties]);

    const availableCitiesList = useMemo(() => {
        const citiesList = new Set<string>();
        citiesInState.forEach(c => citiesList.add(c.name));

        // Also add from existing properties matching the selected state
        const selectedStateName = states.find(s => s.code === filterState)?.name;
        properties.forEach(p => {
            if (p.city?.name && (filterState === 'all' || p.city.state === selectedStateName || p.city.state === filterState)) {
                citiesList.add(p.city.name);
            }
        });
        return Array.from(citiesList).sort();
    }, [citiesInState, properties, filterState, states]);

    const availableStatuses = useMemo(() => {
        const statuses = new Set<string>();
        properties.forEach(p => statuses.add(p.status));
        return Array.from(statuses).sort();
    }, [properties]);

    // Handle central filter resets
    const handleStateChange = (state: string) => {
        setFilterState(state);
        setFilterCity('all');
    };

    // Filtered lists - Optimized for scalability
    const filteredProperties = useMemo(() => {
        const selectedStateName = states.find(s => s.code === filterState)?.name;
        return properties.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(propSearch.toLowerCase()) ||
                p.location.toLowerCase().includes(propSearch.toLowerCase());
            const matchesState = filterState === 'all' || p.city?.state === selectedStateName || p.city?.state === filterState;
            const matchesCity = filterCity === 'all' || p.city?.name === filterCity;
            const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
            const matchesAssignment = !showOnlyUnassigned || (!p.assignedTo || p.assignedTo.length === 0);

            return matchesSearch && matchesState && matchesCity && matchesStatus && matchesAssignment;
        });
    }, [properties, propSearch, filterState, filterCity, statusFilter, showOnlyUnassigned, states]);

    const filteredAgents = useMemo(() => {
        return agents.filter(a =>
            `${a.firstName} ${a.lastName || ''}`.toLowerCase().includes(agentSearch.toLowerCase()) ||
            a.email.toLowerCase().includes(agentSearch.toLowerCase()) ||
            (a.role && a.role.toLowerCase().includes(agentSearch.toLowerCase()))
        );
    }, [agents, agentSearch]);

    const itemsCount = filteredProperties.length;

    // Selection logic
    const toggleProperty = (id: string) => {
        setSelectedPropertyIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAgent = (id: string) => {
        setSelectedAgentIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAllFilteredProperties = () => {
        if (selectedPropertyIds.length === filteredProperties.length && filteredProperties.length > 0) {
            setSelectedPropertyIds([]);
        } else {
            setSelectedPropertyIds(filteredProperties.map(p => p.id));
        }
    };

    const handleBulkAssign = async () => {
        if (!token || selectedPropertyIds.length === 0 || selectedAgentIds.length === 0) return;

        try {
            setProcessing(true);
            await propertyService.bulkAssignConsultants(selectedPropertyIds, selectedAgentIds, token);

            // Refresh
            const updatedProps = await propertyService.getAll(token);
            setProperties(updatedProps);

            setSelectedPropertyIds([]);
            setSelectedAgentIds([]);
            alert('Bulk assignment completed successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed bulk assignment. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-24">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Property Allocation</h1>
                    <p className="text-slate-500 font-medium mt-1">Centralized management for assigning properties to consultants, loan advisers and visit executives.</p>
                </div>
            </div>

            {/* Centralized Filter Bar */}
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
                            {availableCitiesList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="h-10 w-px bg-slate-100 mx-2 hidden lg:block"></div>

                <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Properties Status</span>
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
                            <div className={`w-2 h-2 rounded-full bg-blue-600 ${selectedPropertyIds.length > 0 ? 'animate-pulse' : ''}`}></div>
                            <span className="text-sm font-black text-slate-900">{selectedPropertyIds.length} <span className="text-slate-400 text-[10px] uppercase font-bold">Properties Selected</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-purple-600 ${selectedAgentIds.length > 0 ? 'animate-pulse' : ''}`}></div>
                            <span className="text-sm font-black text-slate-900">{selectedAgentIds.length} <span className="text-slate-400 text-[10px] uppercase font-bold">Agents Selected</span></span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-320px)] min-h-[600px]">
                {/* Section 1: Properties */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-slate-50/30">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                                Step 1: Select Properties ({itemsCount})
                            </h2>
                            <button
                                onClick={selectAllFilteredProperties}
                                className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-[0.15em] bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
                            >
                                {selectedPropertyIds.length === filteredProperties.length && filteredProperties.length > 0 ? 'Deselect All' : 'Select All Filtered'}
                            </button>
                        </div>
                        <div className="relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name or micro-location..."
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                value={propSearch}
                                onChange={(e) => setPropSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {filteredProperties.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                                <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <p className="font-bold text-sm">No properties match your filters</p>
                            </div>
                        ) : (
                            filteredProperties.map(p => {
                                const isSelected = selectedPropertyIds.includes(p.id);
                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => toggleProperty(p.id)}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${isSelected ? 'border-blue-600 bg-blue-50/40 shadow-md shadow-blue-100/10' : 'border-transparent hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'bg-white border-slate-200 group-hover:border-blue-300'
                                                }`}>
                                                {isSelected && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-bold text-sm truncate ${isSelected ? 'text-blue-900' : 'text-slate-900 group-hover:text-blue-600 transition-colors'}`}>{p.name}</p>
                                                    {p.assignedTo && p.assignedTo.length > 0 && (
                                                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[8px] font-black rounded-md uppercase tracking-tighter">
                                                            {p.assignedTo.length} Assigned
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 overflow-hidden whitespace-nowrap">
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">{p.location}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-200 shrink-0"></span>
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">{p.city?.name || 'Uncategorized City'}</span>
                                                </div>
                                                {/* Assigned agents mini-list */}
                                                {p.assignedTo && p.assignedTo.length > 0 && (
                                                    <div className="flex -space-x-1.5 mt-2">
                                                        {p.assignedTo.slice(0, 5).map((con, i) => (
                                                            <div
                                                                key={`${p.id}-${con.id}`}
                                                                className="w-5 h-5 rounded-full border border-white bg-slate-100 flex items-center justify-center text-[7px] font-black text-slate-400"
                                                                title={con.firstName}
                                                            >
                                                                {con.firstName[0]}
                                                            </div>
                                                        ))}
                                                        {p.assignedTo.length > 5 && (
                                                            <div className="w-5 h-5 rounded-full border border-white bg-slate-100 flex items-center justify-center text-[7px] font-black text-slate-400">
                                                                +{p.assignedTo.length - 5}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right ml-4 shrink-0">
                                            <span className="text-xs font-black text-slate-900 block group-hover:text-blue-600 transition-colors">₹{new Intl.NumberFormat('en-IN').format(p.price)}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-tighter mt-0.5 block ${p.status === 'AVAILABLE' ? 'text-green-500' : 'text-slate-400'}`}>{p.status}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Section 2: Consultants */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-slate-50/30">
                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight mb-4">
                            <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span>
                            Step 2: Assign to Agents
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
                        {filteredAgents.map(a => {
                            const isSelected = selectedAgentIds.includes(a.id);
                            return (
                                <div
                                    key={a.id}
                                    onClick={() => toggleAgent(a.id)}
                                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 group ${isSelected ? 'border-purple-600 bg-purple-50/40 shadow-sm' : 'border-transparent hover:bg-slate-50'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${isSelected ? 'bg-purple-600 text-white scale-105 shadow-xl shadow-purple-200' : 'bg-slate-100 text-slate-400'
                                        }`}>
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
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-purple-600 border-purple-600' : 'bg-white border-slate-200 group-hover:border-purple-300'
                                        }`}>
                                        {isSelected && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Sticky Execution Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[95%] md:max-w-3xl z-50">
                <div className="bg-slate-900 rounded-[40px] p-6 shadow-2xl border border-slate-800 flex items-center justify-between gap-8 h-24">
                    <div className="hidden sm:flex items-center gap-8 pl-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Assigning</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-white">{selectedPropertyIds.length}</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Props</span>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-slate-800"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Targeting</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-white">{selectedAgentIds.length}</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Agents</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleBulkAssign}
                        disabled={selectedPropertyIds.length === 0 || selectedAgentIds.length === 0 || processing}
                        className="flex-1 sm:flex-none h-14 px-12 bg-blue-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-blue-500/20 hover:bg-blue-500 hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-20 disabled:hover:scale-100 flex items-center justify-center gap-3 group"
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
