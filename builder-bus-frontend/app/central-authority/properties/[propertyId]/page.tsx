'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { PROPERTY_STATUS_CONFIG } from '@/app/constants/property';
import { userService, User } from '@/app/services/userService';
import { propertyService } from '@/app/services/propertyService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102';

interface Property {
    id: string;
    name: string;
    description: string;
    location: string;
    address: string;
    addressRecord?: {
        line1?: string;
        cityId?: string;
        city?: {
            name: string;
            state: string;
        }
    };
    city?: {
        name: string;
        state: string;
    };
    price: number;
    area: number;
    status: string;
    propertyType: string;
    category: string;
    createdAt: string;
    assignedTo?: User[];
    onboardedBy?: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export default function CentralAuthorityPropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const propertyId = params.propertyId as string;
    const { token } = useAuth();

    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [allAgents, setAllAgents] = useState<User[]>([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
    const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

    const fetchData = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const [propertyData, consultantsData, loanPartnersData] = await Promise.all([
                propertyService.getOne(propertyId, token),
                userService.getAllByRole('CONSULTANT', token),
                userService.getAllByRole('LOAN_PARTNER', token)
            ]);

            const combined = [
                ...consultantsData.data.map((u: User) => ({ ...u, role: u.role || 'CONSULTANT' })),
                ...loanPartnersData.data.map((u: User) => ({ ...u, role: u.role || 'LOAN_PARTNER' }))
            ];

            // De-duplicate by ID
            const combinedAgents = Array.from(new Map(combined.map(u => [u.id, u])).values());

            setProperty(propertyData as any);
            setAllAgents(combinedAgents);
            setSelectedAgentIds((propertyData as any).assignedTo?.map((u: User) => u.id) || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [propertyId, token]);

    const handleAssign = async () => {
        if (!token || !property) return;
        try {
            setIsAssigning(true);
            await propertyService.assignConsultants(property.id, selectedAgentIds, token);
            await fetchData(); // Refresh data
            setAssignmentModalOpen(false);
        } catch (error) {
            alert('Failed to assign agents');
        } finally {
            setIsAssigning(false);
        }
    };

    const toggleAgentSelection = (id: string) => {
        setSelectedAgentIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (loading && !property) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900">Property Not Found</h2>
                <p className="text-gray-500 mt-2">The property you're looking for doesn't exist or you don't have access.</p>
                <Link 
                    href="/dashboard/properties" 
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
                >
                    Back to Properties
                </Link>
            </div>
        );
    }

    const statusConfig = PROPERTY_STATUS_CONFIG[property.status.toLowerCase() as keyof typeof PROPERTY_STATUS_CONFIG] || {
        label: property.status,
        color: 'text-gray-700',
        bgColor: 'bg-gray-100'
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{property.name}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                        <p className="text-gray-600 mt-1">{property.addressRecord?.city?.name || property.location} • {property.addressRecord?.city?.name || property.city?.name}, {property.addressRecord?.city?.state || property.city?.state}</p>
                    </div>
                </div>
                <div className="bg-blue-600 px-6 py-3 rounded-2xl text-white shadow-xl shadow-blue-200 flex flex-col items-end">
                    <p className="text-[10px] opacity-80 font-bold uppercase tracking-[0.2em] text-white">Starting Price</p>
                    <p className="text-2xl font-black text-white">₹{new Intl.NumberFormat('en-IN').format(property.price)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Property Overview
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                            {[
                                { label: 'Type', value: property.propertyType },
                                { label: 'Category', value: property.category || 'N/A', capitalize: true },
                                { label: 'Total Area', value: `${property.area} Sq Ft` },
                                { label: 'Created', value: new Date(property.createdAt).toLocaleDateString() },
                            ].map((stat, idx) => (
                                <div key={idx} className="space-y-1">
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{stat.label}</p>
                                    <p className={`text-gray-900 font-bold ${stat.capitalize ? 'capitalize' : ''}`}>{stat.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Description</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">{property.description || 'No description provided.'}</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            Location & Address
                        </h2>
                        <div className="space-y-6">
                            <div className="flex gap-5 p-6 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Address</p>
                                    <p className="text-gray-900 mt-1 font-bold text-lg leading-tight">{property.addressRecord?.line1 || property.address || property.location}</p>
                                    <p className="text-sm text-gray-500 mt-1 font-semibold">{property.addressRecord?.city?.name || property.city?.name}, {property.addressRecord?.city?.state || property.city?.state}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Consultant Assignment Section */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    Assigned Agents
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">Personnel who can manage leads for this property.</p>
                            </div>
                            <button
                                onClick={() => setAssignmentModalOpen(true)}
                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Manage Assignments
                            </button>
                        </div>

                        {property.assignedTo && property.assignedTo.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {property.assignedTo.map((agent) => (
                                    <div key={agent.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-blue-100 transition-all group">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">
                                            {agent.firstName[0]}{agent.lastName?.[0] || ''}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-gray-900 truncate">{agent.firstName} {agent.lastName}</p>
                                                <span className="px-1.5 py-0.5 bg-white text-slate-400 text-[7px] font-black rounded-md uppercase tracking-tighter border border-slate-100">
                                                    {agent.role?.replace('-', ' ') || 'agent'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 truncate font-medium">{agent.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 px-4 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-gray-400">No consultants assigned yet.</p>
                                <button
                                    onClick={() => setAssignmentModalOpen(true)}
                                    className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
                                >
                                    Assign your first consultant
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Details */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Onboarding Agent
                        </h2>
                        {property.onboardedBy ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-black text-xl shadow-sm">
                                        {property.onboardedBy.firstName[0]}{property.onboardedBy.lastName?.[0] || ''}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 text-lg leading-tight truncate">{property.onboardedBy.firstName} {property.onboardedBy.lastName}</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">Property Partner</p>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-gray-50 space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-gray-600 group cursor-default">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="font-medium truncate">{property.onboardedBy.email}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-4 px-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
                                <p className="text-xs text-gray-400 italic">No agent information available.</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white border border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-blue-600/20 transition-all duration-700"></div>
                        <h2 className="text-lg font-bold mb-4 relative z-10 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Central Authority
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed relative z-10 font-medium">
                            Review platform compliance, manage consultant assignments, and auditing metrics for this listing.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 relative z-10">
                            <button className="w-full py-3.5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-lg shadow-white/5">
                                Generate Audit Report
                            </button>
                            <button className="w-full py-3.5 bg-slate-800/80 text-white border border-slate-700/50 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95">
                                Contact Partner
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignment Modal */}
            {assignmentModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 border border-gray-100">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Assign Agents</h2>
                                <p className="text-sm text-gray-500 font-medium mt-1">Select consultants, loan partners, or visit executives.</p>
                            </div>
                            <button
                                onClick={() => setAssignmentModalOpen(false)}
                                className="p-2.5 hover:bg-gray-200 rounded-2xl transition-all border border-transparent hover:border-gray-300 group"
                            >
                                <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-8 pb-4 max-h-[400px] overflow-y-auto space-y-3 custom-scrollbar">
                            {allAgents.map((agent) => {
                                const isSelected = selectedAgentIds.includes(agent.id);
                                return (
                                    <div
                                        key={agent.id}
                                        onClick={() => toggleAgentSelection(agent.id)}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer group select-none ${isSelected
                                            ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100/50'
                                            : 'border-gray-50 bg-gray-50/30 hover:bg-white hover:border-gray-200'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm transition-all duration-300 ${isSelected ? 'bg-blue-600 text-white scale-110 shadow-blue-200' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                                            }`}>
                                            {agent.firstName[0]}{agent.lastName?.[0] || ''}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`font-black text-sm tracking-tight transition-colors ${isSelected ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-700'}`}>
                                                    {agent.firstName} {agent.lastName}
                                                </p>
                                                <span className={`px-1.5 py-0.5 text-[8px] font-black rounded-md uppercase tracking-tighter ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    {agent.role?.replace('-', ' ') || 'agent'}
                                                </span>
                                            </div>
                                            <p className={`text-xs font-bold truncate transition-colors ${isSelected ? 'text-blue-500/80' : 'text-gray-400'}`}>
                                                {agent.email}
                                            </p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 scale-110' : 'border-gray-200 bg-white'
                                            }`}>
                                            {isSelected && (
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {allAgents.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-gray-400 font-bold">No agents found in the system.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 pt-4 flex gap-4">
                            <button
                                onClick={() => setAssignmentModalOpen(false)}
                                className="flex-1 px-6 py-4 border-2 border-gray-100 text-gray-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={isAssigning}
                                className="flex-1 px-6 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95 shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                            >
                                {isAssigning ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : 'Save Assignments'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
