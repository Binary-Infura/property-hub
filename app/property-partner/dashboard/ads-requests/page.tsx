'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { adsRequestsService } from '@/app/services/adsRequestsService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Project {
    id: string;
    name: string;
    location: string;
}

interface AdsRequest {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    project?: {
        id: string;
        name: string;
        location: string;
    };
    budget?: number;
    platform?: string;
    requestedBy: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        roles: string[];
    };
    createdAt: string;
    updatedAt: string;
}

export default function PropertyPartnerAdsRequestsPage() {
    const { token } = useAuth();
    const [requests, setRequests] = useState<AdsRequest[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectId, setProjectId] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [budget, setBudget] = useState<number | ''>('');
    const [platform, setPlatform] = useState('');

    useEffect(() => {
        fetchRequests();
        fetchProjects();
    }, [token]);

    const fetchRequests = async () => {
        if (!token) return;
        try {
            const data = await adsRequestsService.getAdsRequests(token);
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch ads requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/api/projects/my`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        }
    };

    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            setSubmitting(true);
            await adsRequestsService.createAdsRequest(token, {
                title,
                description,
                projectId,
                priority,
                budget: budget === '' ? undefined : Number(budget),
                platform: platform || undefined
            });

            // Reset form
            setTitle('');
            setDescription('');
            setProjectId('');
            setPriority('MEDIUM');
            setBudget('');
            setPlatform('');
            setIsCreateModalOpen(false);

            // Refresh list
            await fetchRequests();
        } catch (error) {
            console.error("Failed to create ads request:", error);
            alert("Failed to create the request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'bg-red-50 text-red-700 border-red-100';
            case 'MEDIUM': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'LOW': return 'bg-green-50 text-green-700 border-green-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Ads Requests</h1>
                    <p className="text-gray-600 mt-1">Request and manage promotional campaigns for your projects</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 font-bold transition flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    New Ad Request
                </button>
            </div>

            {/* Requests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.length === 0 ? (
                    <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Ads Requests Yet</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            You haven't made any advertising requests. Create your first request to promote your projects!
                        </p>
                    </div>
                ) : (
                    requests.map((request) => (
                        <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{request.title}</h3>
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusColor(request.status)}`}>
                                        {request.status}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-6 line-clamp-2 flex-1">
                                    {request.description || <span className="italic text-gray-400">No description provided</span>}
                                </p>

                                <div className="space-y-3 pt-4 border-t border-gray-50 mt-auto">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Priority
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getPriorityColor(request.priority)}`}>
                                            {request.priority}
                                        </span>
                                    </div>

                                    {(request.budget || request.platform) && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 flex items-center gap-1.5">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Details
                                            </span>
                                            <span className="font-semibold text-gray-900 border px-2 py-0.5 rounded text-xs bg-gray-50">
                                                {request.platform && <span className="mr-1">{request.platform}</span>}
                                                {request.budget && <span className={request.platform ? "ml-1 border-l pl-2 border-gray-300" : ""}>₹{request.budget}</span>}
                                            </span>
                                        </div>
                                    )}

                                    {request.project && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 flex items-center gap-1.5">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                Project
                                            </span>
                                            <span className="font-semibold text-gray-900 truncate max-w-[150px]" title={request.project.name}>
                                                {request.project.name}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Date
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Request Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Create Ads Request</h2>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-1.5 rounded-lg border border-transparent hover:border-gray-200 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="create-ad-request" onSubmit={handleCreateRequest} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="e.g. Summer Promo for Luxury Villas"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project <span className="text-red-500">*</span></label>
                                    <select
                                        required
                                        value={projectId}
                                        onChange={e => setProjectId(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white"
                                    >
                                        <option value="" disabled>Select a project</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Platform</label>
                                        <select
                                            value={platform}
                                            onChange={e => setPlatform(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white"
                                        >
                                            <option value="">Any Platform</option>
                                            <option value="Google Ads">Google Ads</option>
                                            <option value="Facebook">Facebook</option>
                                            <option value="Instagram">Instagram</option>
                                            <option value="LinkedIn">LinkedIn</option>
                                            <option value="Property Portals">Property Portals</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Budget (₹)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1000"
                                            value={budget}
                                            onChange={e => setBudget(e.target.value ? Number(e.target.value) : '')}
                                            placeholder="e.g. 50000"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority Level</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'LOW', label: 'Low', color: 'text-green-700 bg-green-50 border-green-200 ring-green-500' },
                                            { id: 'MEDIUM', label: 'Medium', color: 'text-orange-700 bg-orange-50 border-orange-200 ring-orange-500' },
                                            { id: 'HIGH', label: 'High', color: 'text-red-700 bg-red-50 border-red-200 ring-red-500' }
                                        ].map(opt => (
                                            <div
                                                key={opt.id}
                                                onClick={() => setPriority(opt.id)}
                                                className={`cursor-pointer rounded-xl border py-2.5 text-center text-sm font-bold transition-all
                                                    ${priority === opt.id ? `ring-2 ring-offset-1 ${opt.color}` : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                {opt.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                                    <textarea
                                        rows={4}
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Describe what kind of advertising you need..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                                    ></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="create-ad-request"
                                disabled={submitting}
                                className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200 flex items-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>Submit Request</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
