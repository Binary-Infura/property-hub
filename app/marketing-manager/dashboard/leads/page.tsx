'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { marketingService } from '@/app/services/marketingService';

interface Lead {
    id: string;
    name: string;
    email?: string;
    phone: string;
    status: string;
    source?: string;
    notes?: string;
    createdAt: string;
    campaign?: {
        id: string;
        name: string;
        platform: string;
    };
    property?: {
        id: string;
        name: string;
    };
    region: {
        id: string;
        name: string;
    };
}

interface Campaign {
    id: string;
    name: string;
    platform: string;
    status: string;
    leadsCount: number;
}

export default function CampaignLeadsPage() {
    const { token } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                const campaignsData = await marketingService.getCampaigns(token);
                setCampaigns(campaignsData);

                // Fetch all leads from campaigns
                const allLeads: Lead[] = [];
                for (const campaign of campaignsData) {
                    if (campaign.leads && campaign.leads.length > 0) {
                        const campaignLeads = campaign.leads.map((lead: any) => ({
                            ...lead,
                            campaign: {
                                id: campaign.id,
                                name: campaign.name,
                                platform: campaign.platform,
                            },
                        }));
                        allLeads.push(...campaignLeads);
                    }
                }
                setLeads(allLeads);
            } catch (error) {
                console.error("Failed to fetch campaign leads:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const filteredLeads = leads.filter((lead) => {
        if (selectedCampaign !== 'all' && lead.campaign?.id !== selectedCampaign) return false;
        if (statusFilter !== 'all' && lead.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
        return true;
    });

    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'contacted': return 'bg-yellow-100 text-yellow-800';
            case 'qualified': return 'bg-purple-100 text-purple-800';
            case 'converted': return 'bg-green-100 text-green-800';
            case 'lost': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="p-8 flex items-center justify-center min-h-screen">Loading campaign leads...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Campaign Leads</h1>
                <p className="text-gray-600 mt-1">View and manage all leads generated from marketing campaigns</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Leads</div>
                    <div className="text-3xl font-bold text-gray-900">{leads.length}</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">New Leads</div>
                    <div className="text-3xl font-bold text-blue-600">
                        {leads.filter(l => l.status.toLowerCase() === 'new').length}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Qualified</div>
                    <div className="text-3xl font-bold text-purple-600">
                        {leads.filter(l => l.status.toLowerCase() === 'qualified').length}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Converted</div>
                    <div className="text-3xl font-bold text-green-600">
                        {leads.filter(l => l.status.toLowerCase() === 'converted').length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-3">
                <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                    <option value="all">All Campaigns</option>
                    {campaigns.map((campaign) => (
                        <option key={campaign.id} value={campaign.id}>
                            {campaign.name} ({campaign.leadsCount || 0} leads)
                        </option>
                    ))}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="visiting">Visiting</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                </select>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lead
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Campaign
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Source
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Region
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No leads found. Leads will appear here when campaigns generate them.
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{lead.name}</div>
                                            <div className="text-sm text-gray-500">{lead.email || lead.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{lead.campaign?.name || 'N/A'}</div>
                                            <div className="text-xs text-gray-500">{lead.campaign?.platform || ''}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(lead.status)}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {lead.source || 'Direct'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {lead.region.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
