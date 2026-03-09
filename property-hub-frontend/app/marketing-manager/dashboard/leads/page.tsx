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
    campaignId?: string;
    projectId?: string;
    campaign?: {
        id: string;
        name: string;
        platform: string;
    };
    project?: {
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
    const [properties, setProperties] = useState<any[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [leadFormData, setLeadFormData] = useState({
        name: '',
        phone: '',
        email: '',
        projectId: '',
        campaignId: '',
        source: 'Manual',
        notes: ''
    });

    const [uploadData, setUploadData] = useState<string>('');

    const fetchData = async () => {
        if (!token) return;
        try {
            const [campaignsData, leadsData, propsData] = await Promise.all([
                marketingService.getCampaigns(token),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/leads`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(res => res.json()),
                marketingService.getProperties(token)
            ]);

            setCampaigns(campaignsData);
            setLeads(leadsData);
            setProperties(propsData);
        } catch (error) {
            console.error("Failed to fetch campaign leads:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleLeadInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLeadFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setSubmitting(true);
        try {
            await marketingService.createLead(token, {
                ...leadFormData,
                projectId: leadFormData.projectId || undefined,
                campaignId: leadFormData.campaignId || undefined,
            });
            setShowCreateModal(false);
            setLeadFormData({
                name: '',
                phone: '',
                email: '',
                projectId: '',
                campaignId: '',
                source: 'Manual',
                notes: ''
            });
            fetchData();
        } catch (error) {
            console.error("Failed to create lead:", error);
            alert("Failed to create lead.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBulkUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !uploadData) return;
        setSubmitting(true);
        try {
            // Simple CSV parsing
            const rows = uploadData.split('\n').filter(row => row.trim());
            const headers = rows[0].split(',').map(h => h.trim().toLowerCase());

            const leadsToUpload = rows.slice(1).map(row => {
                const values = row.split(',').map(v => v.trim());
                const lead: any = {};
                headers.forEach((header, index) => {
                    if (header === 'name') lead.name = values[index];
                    if (header === 'phone') lead.phone = values[index];
                    if (header === 'email') lead.email = values[index];
                    if (header === 'source') lead.source = values[index];
                    if (header === 'notes') lead.notes = values[index];
                });
                return lead;
            }).filter(l => l.name && l.phone);

            if (leadsToUpload.length === 0) {
                alert("No valid leads found in CSV. Required headers: name, phone");
                setSubmitting(false);
                return;
            }

            await marketingService.bulkUploadLeads(token, leadsToUpload);
            setShowUploadModal(false);
            setUploadData('');
            fetchData();
            alert(`Successfully uploaded ${leadsToUpload.length} leads.`);
        } catch (error) {
            console.error("Failed to upload leads:", error);
            alert("Failed to upload leads.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredLeads = leads.filter((lead) => {
        if (selectedCampaign !== 'all' && lead.campaignId !== selectedCampaign) return false;
        if (statusFilter !== 'all' && lead.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
        return true;
    });

    const getStatusColor = (status: string) => {
        const statusLower = status?.toLowerCase() || 'new';
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
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Campaign Leads</h1>
                    <p className="text-gray-600 mt-1">View and manage all leads generated from marketing campaigns</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-6 py-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition font-medium"
                    >
                        Upload Leads (CSV)
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                    >
                        + Create Manual Lead
                    </button>
                </div>
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
                        {leads.filter(l => l.status?.toLowerCase() === 'new').length}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Qualified</div>
                    <div className="text-3xl font-bold text-purple-600">
                        {leads.filter(l => l.status?.toLowerCase() === 'qualified').length}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Converted</div>
                    <div className="text-3xl font-bold text-green-600">
                        {leads.filter(l => l.status?.toLowerCase() === 'converted').length}
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
                            {campaign.name}
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
                                    Created
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No leads found.
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
                                            <div className="text-sm text-gray-900">
                                                {campaigns.find(c => c.id === lead.campaignId)?.name || 'N/A'}
                                            </div>
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
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Manual Lead Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Manual Lead</h2>
                        <form onSubmit={handleCreateLead} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={leadFormData.name}
                                    onChange={handleLeadInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        required
                                        value={leadFormData.phone}
                                        onChange={handleLeadInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={leadFormData.email}
                                        onChange={handleLeadInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Property (Optional)</label>
                                <select
                                    name="projectId"
                                    value={leadFormData.projectId}
                                    onChange={handleLeadInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="">Select Property</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign (Optional)</label>
                                <select
                                    name="campaignId"
                                    value={leadFormData.campaignId}
                                    onChange={handleLeadInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="">Select Campaign</option>
                                    {campaigns.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    name="notes"
                                    rows={3}
                                    value={leadFormData.notes}
                                    onChange={handleLeadInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold disabled:opacity-50"
                                >
                                    {submitting ? 'Creating...' : 'Create Lead'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload Leads Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Leads (CSV)</h2>
                        <p className="text-sm text-gray-600 mb-4"> Paste comma-separated lead data. Required columns: <b>name, phone</b>. Optional: email, source, notes.</p>
                        <form onSubmit={handleBulkUpload} className="space-y-4">
                            <div>
                                <textarea
                                    rows={8}
                                    value={uploadData}
                                    onChange={(e) => setUploadData(e.target.value)}
                                    placeholder="name,phone,email,notes&#10;John Doe,+919876543210,john@example.com,Interested in prime location"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !uploadData}
                                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold disabled:opacity-50"
                                >
                                    {submitting ? 'Uploading...' : 'Upload Leads'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
