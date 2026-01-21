'use client';

import { useState } from 'react';
import { Lead } from '@/app/types/lead';
import LeadCard from '@/app/components/LeadCard';

interface Campaign {
    id: string;
    propertyId: string;
    propertyTitle: string;
    type: string;
    status: 'Active' | 'Completed' | 'Paused';
    budget: string;
    spent: string;
    leadsGenerated: number;
    costPerLead: string;
    startDate: string;
    endDate: string;
}

interface Consultant {
    id: string;
    name: string;
    activeLeads: number;
}

export default function CampaignsAndLeadsPage() {
    const [activeTab, setActiveTab] = useState<'campaigns' | 'leads'>('campaigns');
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
    const [showAssignModal, setShowAssignModal] = useState(false);

    // Mock Data
    const campaigns: Campaign[] = [
        {
            id: 'c1',
            propertyId: '1',
            propertyTitle: 'Sunset Towers, Bandra',
            type: 'Social Media',
            status: 'Active',
            budget: '₹50,000',
            spent: '₹12,400',
            leadsGenerated: 15,
            costPerLead: '₹826',
            startDate: '2024-01-15',
            endDate: '2024-02-15',
        },
        {
            id: 'c2',
            propertyId: '2',
            propertyTitle: 'Green Valley Homes, Powai',
            type: 'Portal Boosting',
            status: 'Active',
            budget: '₹25,000',
            spent: '₹5,000',
            leadsGenerated: 8,
            costPerLead: '₹625',
            startDate: '2024-01-20',
            endDate: '2024-02-05',
        },
    ];

    const leads: Lead[] = [
        {
            id: 'l1',
            name: 'Rahul Sharma',
            phone: '+91 98765 43210',
            location: 'Bandra West, Mumbai',
            budget: '₹2 Cr - ₹2.5 Cr',
            propertyType: '3 BHK Apartment',
            buyerIntent: 'end-use',
            source: 'Facebook Ad',
            status: 'new',
            qualityScore: 85,
            createdAt: new Date().toISOString(),
            region: 'Mumbai',
        },
        {
            id: 'l2',
            name: 'Priya Patel',
            phone: '+91 98765 12345',
            location: 'Powai, Mumbai',
            budget: '₹80 L - ₹1 Cr',
            propertyType: '2 BHK Apartment',
            buyerIntent: 'investment',
            source: 'MagicBricks',
            status: 'assigned',
            qualityScore: 72,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            region: 'Mumbai',
            assignedTo: {
                region: 'Mumbai',
                assignedAt: new Date().toISOString(),
            },
        },
        {
            id: 'l3',
            name: 'Vikram Singh',
            phone: '+91 98765 67890',
            location: 'Juhu, Mumbai',
            budget: '₹5 Cr+',
            propertyType: '4 BHK Apartment',
            buyerIntent: 'end-use',
            source: 'Direct Message',
            status: 'new',
            qualityScore: 92,
            createdAt: new Date().toISOString(),
            region: 'Mumbai',
        }
    ];

    const consultants: Consultant[] = [
        { id: 'cons1', name: 'Amit Verma', activeLeads: 12 },
        { id: 'cons2', name: 'Sneha Gupta', activeLeads: 8 },
        { id: 'cons3', name: 'Rajesh Kumar', activeLeads: 15 },
    ];

    const toggleLeadSelection = (leadId: string) => {
        const newSelected = new Set(selectedLeads);
        if (newSelected.has(leadId)) {
            newSelected.delete(leadId);
        } else {
            newSelected.add(leadId);
        }
        setSelectedLeads(newSelected);
    };

    const handleBulkAssign = (consultantId: string) => {
        const leadCount = selectedLeads.size;
        const assignedConsultant = consultants.find(c => c.id === consultantId);

        // In a real app, you would make an API call here
        alert(`Successfully assigned ${leadCount} lead${leadCount > 1 ? 's' : ''} to ${assignedConsultant?.name}`);

        setSelectedLeads(new Set());
        setShowAssignModal(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Campaigns & Leads</h1>
                        <p className="text-gray-600 mt-1">Monitor marketing performance and manage lead assignments</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-8 bg-white rounded-t-lg">
                    <button
                        onClick={() => setActiveTab('campaigns')}
                        className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${activeTab === 'campaigns'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Active Campaigns
                    </button>
                    <button
                        onClick={() => setActiveTab('leads')}
                        className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${activeTab === 'leads'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Leads Management
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'campaigns' ? (
                    <div className="grid gap-6">
                        {campaigns.map((campaign) => (
                            <div key={campaign.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{campaign.propertyTitle}</h3>
                                        <span className="inline-block mt-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                                            {campaign.type}
                                        </span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${campaign.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {campaign.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                    <div>
                                        <p className="text-sm text-gray-500">Budget</p>
                                        <p className="text-lg font-semibold text-gray-900">{campaign.budget}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Spent</p>
                                        <p className="text-lg font-semibold text-gray-900">{campaign.spent}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Leads Generated</p>
                                        <p className="text-lg font-semibold text-blue-600">{campaign.leadsGenerated}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Avg. Cost/Lead</p>
                                        <p className="text-lg font-semibold text-green-600">{campaign.costPerLead}</p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                                    <p>Running: {campaign.startDate} to {campaign.endDate}</p>
                                    <button
                                        onClick={() => setActiveTab('leads')}
                                        className="text-blue-600 font-medium hover:text-blue-800"
                                    >
                                        View Leads →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6 relative">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
                                {selectedLeads.size > 0 && (
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                        {selectedLeads.size} selected
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <select className="border border-gray-300 rounded-md py-1 px-3 text-sm">
                                    <option>All Sources</option>
                                    <option>Social Media</option>
                                    <option>Portals</option>
                                </select>
                                <select className="border border-gray-300 rounded-md py-1 px-3 text-sm">
                                    <option>All Statuses</option>
                                    <option>New</option>
                                    <option>Assigned</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 pb-20">
                            {leads.map((lead) => (
                                <div key={lead.id} className="relative">
                                    <LeadCard
                                        lead={lead}
                                        onSelect={() => toggleLeadSelection(lead.id)}
                                        isSelected={selectedLeads.has(lead.id)}
                                    />

                                    {lead.status === 'new' && !selectedLeads.has(lead.id) && selectedLeads.size === 0 && (
                                        <div className="absolute top-4 right-4 z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleLeadSelection(lead.id); // Select it
                                                    setShowAssignModal(true); // Open modal immediately for single action if desired, or just select
                                                }}
                                                className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-200 transition font-medium"
                                            >
                                                Select
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Bulk Action Bar */}
                        {selectedLeads.size > 0 && (
                            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white text-gray-900 px-6 py-4 rounded-xl shadow-xl border border-gray-200 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-4">
                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                                        {selectedLeads.size}
                                    </div>
                                    <span className="font-medium">Leads Selected</span>
                                </div>
                                <div className="h-6 w-px bg-gray-300"></div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowAssignModal(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                                    >
                                        Assign to Consultant
                                    </button>
                                    <button
                                        onClick={() => setSelectedLeads(new Set())}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Assignment Modal */}
                        {showAssignModal && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Assign {selectedLeads.size} Lead{selectedLeads.size !== 1 ? 's' : ''}</h3>
                                    <p className="text-gray-600 mb-6">Select a consultant to assign the selected leads to:</p>

                                    <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                                        {consultants.map(consultant => (
                                            <button
                                                key={consultant.id}
                                                onClick={() => handleBulkAssign(consultant.id)}
                                                className="w-full flex justify-between items-center p-4 hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-blue-200 group-hover:text-blue-700">
                                                        👤
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-semibold text-gray-900">{consultant.name}</p>
                                                        <p className="text-xs text-gray-500">{consultant.activeLeads} active leads</p>
                                                    </div>
                                                </div>
                                                <div className="w-4 h-4 rounded-full border border-gray-300 group-hover:border-blue-500 group-hover:bg-blue-500"></div>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setShowAssignModal(false)}
                                        className="w-full py-3 text-gray-500 font-medium hover:text-gray-900 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
