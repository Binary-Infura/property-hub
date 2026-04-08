'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { marketingService } from '@/app/services/marketingService';

interface AdsRequest {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    originalCampaignId: string;
    project?: {
        id: string;
        name: string;
        location: string;
    };
    requestedBy: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    };
    createdAt: string;
    updatedAt: string;
}

export default function CentralAuthorityAdsRequestsPage() {
    const { token } = useAuth();
    const [requests, setRequests] = useState<AdsRequest[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<AdsRequest | null>(null);

    useEffect(() => {
        fetchRequests();
    }, [token]);

    const fetchRequests = async () => {
        if (!token) return;
        try {
            const campaigns = await marketingService.getCampaigns(token).catch(() => []);

            const formattedCampaigns = campaigns.map((campaign: any) => ({
                id: `collab-${campaign.id}`,
                originalCampaignId: campaign.id,
                title: `Collaboration Request: ${campaign.name || 'Untitled'}`,
                description: `Requested budget: ₹${campaign.budget?.toLocaleString() || 0} for platform: ${campaign.platform}`,
                status: campaign.status,
                priority: 'HIGH',
                project: campaign.project ? {
                    id: campaign.project.id,
                    name: campaign.project.name,
                    location: campaign.project.addressRecord?.city || campaign.project.addressId || 'N/A'
                } : undefined,
                requestedBy: campaign.project?.onboardedBy ? {
                   id: campaign.project.onboardedBy.id,
                   firstName: campaign.project.onboardedBy.firstName,
                   lastName: campaign.project.onboardedBy.lastName,
                   email: campaign.project.onboardedBy.email,
                   role: 'PROPERTY_PARTNER'
                } : {
                   id: 'unknown',
                   firstName: 'Property',
                   lastName: 'Partner',
                   email: '',
                   role: 'PROPERTY_PARTNER'
                },
                createdAt: campaign.createdAt,
                updatedAt: campaign.updatedAt || campaign.createdAt
            }));

            const combined = formattedCampaigns.sort((a: any, b: any) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setRequests(combined);
        } catch (error) {
            console.error("Failed to fetch ads requests:", error);
        } finally {
            setLoading(false);
        }
    };


    const filteredRequests = requests.filter((req) => {
        if (statusFilter !== 'all' && req.status !== statusFilter) return false;
        if (priorityFilter !== 'all' && req.priority !== priorityFilter) return false;
        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'bg-red-100 text-red-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'LOW': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="p-8 flex items-center justify-center min-h-screen">Loading ads requests...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Ads Requests</h1>
                <p className="text-gray-600 mt-1">Manage advertising requests from builders</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Requests</div>
                    <div className="text-3xl font-bold text-gray-900">{requests.length}</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Pending</div>
                    <div className="text-3xl font-bold text-yellow-600">
                        {requests.filter(r => r.status === 'PENDING').length}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Approved</div>
                    <div className="text-3xl font-bold text-green-600">
                        {requests.filter(r => r.status === 'APPROVED').length}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">High Priority</div>
                    <div className="text-3xl font-bold text-red-600">
                        {requests.filter(r => r.priority === 'HIGH').length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-3">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="COMPLETED">Completed</option>
                </select>
                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                    <option value="all">All Priority</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </select>
            </div>

            {/* Requests Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRequests.length === 0 ? (
                    <div className="col-span-2 bg-white rounded-xl p-12 text-center text-gray-500">
                        No ads requests found.
                    </div>
                ) : (
                    filteredRequests.map((request) => (
                        <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{request.title}</h3>
                                        <p className="text-sm text-gray-600 mb-3">{request.description || 'No description provided'}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                        {request.status}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                        {request.priority} PRIORITY
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4 text-sm">
                                    {request.project && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500">Location:</span>
                                                <span className="font-medium text-gray-900">{request.project.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500">Project:</span>
                                                <span className="font-medium text-gray-900">{request.project.name}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Requested by:</span>
                                        <span className="font-medium text-gray-900">
                                            {request.requestedBy.firstName} {request.requestedBy.lastName}
                                        </span>
                                        <span className="text-xs text-gray-500">({request.requestedBy.role})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Created:</span>
                                        <span className="text-gray-900">{new Date(request.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">

                                    <button
                                        onClick={() => setSelectedRequest(request)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedRequest.title}</h2>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Description</label>
                                <p className="text-gray-900">{selectedRequest.description || 'No description'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <p className="text-gray-900">{selectedRequest.status}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Priority</label>
                                    <p className="text-gray-900">{selectedRequest.priority}</p>
                                </div>
                            </div>
                            {selectedRequest.project && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Project / Location</label>
                                    <p className="text-gray-900">{selectedRequest.project.name} - {selectedRequest.project.location}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-gray-500">Requested By</label>
                                <p className="text-gray-900">
                                    {selectedRequest.requestedBy.firstName} {selectedRequest.requestedBy.lastName} ({selectedRequest.requestedBy.email})
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedRequest(null)}
                            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
