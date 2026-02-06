'use client';

import { useState } from 'react';

export default function CampaignsPage() {
    const [filter, setFilter] = useState('all');
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Mock data
    const campaigns = [
        {
            id: '1',
            name: 'Mumbai Premium Properties Q1',
            status: 'active',
            platform: 'Google Ads',
            budget: 150000,
            spent: 98500,
            startDate: '2024-01-01',
            endDate: '2024-03-31',
            targetRegions: ['Mumbai South', 'Mumbai Central'],
            assignedTo: ['Rajesh Kumar', 'Sneha Reddy'],
            performance: {
                impressions: 125000,
                clicks: 8500,
                leads: 420,
                conversions: 78,
                cpl: 234,
                conversionRate: 18.6,
            },
        },
        {
            id: '2',
            name: 'Pune Luxury Villas Campaign',
            status: 'active',
            platform: 'Facebook',
            budget: 100000,
            spent: 67800,
            startDate: '2024-02-01',
            endDate: '2024-04-30',
            targetRegions: ['Pune West'],
            assignedTo: ['Priya Sharma'],
            performance: {
                impressions: 98000,
                clicks: 6200,
                leads: 280,
                conversions: 52,
                cpl: 242,
                conversionRate: 18.5,
            },
        },
        {
            id: '3',
            name: 'Bangalore Tech City',
            status: 'paused',
            platform: 'Instagram',
            budget: 80000,
            spent: 45200,
            startDate: '2024-01-15',
            endDate: '2024-03-15',
            targetRegions: ['Bangalore North'],
            assignedTo: ['Vikram Singh'],
            performance: {
                impressions: 72000,
                clicks: 4800,
                leads: 190,
                conversions: 34,
                cpl: 238,
                conversionRate: 17.9,
            },
        },
    ];

    const filteredCampaigns = campaigns.filter((c) => {
        if (filter === 'all') return true;
        return c.status === filter;
    });

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Marketing Campaigns</h1>
                <p className="text-gray-600 mt-1">Create and manage all marketing campaigns</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Campaigns</div>
                    <div className="text-3xl font-bold text-gray-900">{campaigns.length}</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Active</div>
                    <div className="text-3xl font-bold text-green-600">
                        {campaigns.filter((c) => c.status === 'active').length}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Budget</div>
                    <div className="text-3xl font-bold text-gray-900">
                        ₹{campaigns.reduce((sum, c) => sum + c.budget, 0).toLocaleString()}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Leads</div>
                    <div className="text-3xl font-bold text-purple-600">
                        {campaigns.reduce((sum, c) => sum + c.performance.leads, 0)}
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="mb-6 flex justify-between items-center">
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                        <option value="draft">Draft</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        <option value="all">All Platforms</option>
                        <option value="google-ads">Google Ads</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="linkedin">LinkedIn</option>
                    </select>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                    + Create Campaign
                </button>
            </div>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCampaigns.map((campaign) => (
                    <div key={campaign.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Campaign Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{campaign.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm text-gray-600">{campaign.platform}</span>
                                        <span className="text-gray-400">•</span>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${campaign.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : campaign.status === 'paused'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {campaign.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Budget Progress */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Budget Utilization</span>
                                    <span className="font-medium text-gray-900">
                                        ₹{campaign.spent.toLocaleString()} / ₹{campaign.budget.toLocaleString()}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full"
                                        style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {Math.round((campaign.spent / campaign.budget) * 100)}% used
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Timeline:</span> {campaign.startDate} to {campaign.endDate}
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="p-6 bg-gray-50">
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Impressions</div>
                                    <div className="text-lg font-bold text-gray-900">
                                        {campaign.performance.impressions.toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Clicks</div>
                                    <div className="text-lg font-bold text-gray-900">
                                        {campaign.performance.clicks.toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Leads</div>
                                    <div className="text-lg font-bold text-purple-600">{campaign.performance.leads}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Conversions</div>
                                    <div className="text-lg font-bold text-green-600">{campaign.performance.conversions}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">CPL</div>
                                    <div className="text-lg font-bold text-gray-900">₹{campaign.performance.cpl}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Conv. Rate</div>
                                    <div className="text-lg font-bold text-gray-900">{campaign.performance.conversionRate}%</div>
                                </div>
                            </div>
                        </div>

                        {/* Campaign Details */}
                        <div className="p-6 border-t border-gray-200">
                            <div className="mb-3">
                                <div className="text-xs text-gray-600 mb-1">Target Regions</div>
                                <div className="flex flex-wrap gap-2">
                                    {campaign.targetRegions.map((region, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            {region}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="text-xs text-gray-600 mb-1">Assigned To</div>
                                <div className="flex flex-wrap gap-2">
                                    {campaign.assignedTo.map((person, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                            {person}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium">
                                    View Details
                                </button>
                                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                                    {campaign.status === 'active' ? 'Pause' : 'Resume'}
                                </button>
                                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Campaign Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] p-10 max-w-2xl w-full shadow-2xl ring-1 ring-black/5 max-h-[95vh] overflow-y-auto">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Create New Campaign</h2>
                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Name</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder:text-gray-400"
                                    placeholder="Enter campaign name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label>
                                    <select className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900 appearance-none">
                                        <option value="">Select platform</option>
                                        <option value="google-ads">Google Ads</option>
                                        <option value="facebook">Facebook</option>
                                        <option value="instagram">Instagram</option>
                                        <option value="linkedin">LinkedIn</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Budget (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder:text-gray-400"
                                        placeholder="Enter budget"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows={4}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder:text-gray-400 resize-none"
                                    placeholder="Enter campaign description"
                                ></textarea>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="flex-1 px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-8 py-4 bg-[#a855f7] text-white rounded-2xl hover:bg-[#9333ea] shadow-xl shadow-purple-200 hover:shadow-purple-300 transition-all font-bold text-lg"
                                >
                                    Create Campaign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
