'use client';

import { useState } from 'react';

export default function MarketingManagerDashboard() {
    const [timeRange, setTimeRange] = useState('30d');

    // Mock data - in production, this would come from API
    const stats = {
        activeCampaigns: 12,
        totalLeads: 1250,
        costPerLead: 245,
        conversionRate: 18.5,
        budgetUtilization: 78,
        monthlyBudget: 500000,
    };

    const campaigns = [
        {
            id: '1',
            name: 'Mumbai Premium Properties',
            status: 'active',
            platform: 'Google Ads',
            budget: 150000,
            spent: 98500,
            leads: 420,
            cpl: 234,
            conversions: 78,
            conversionRate: 18.6,
        },
        {
            id: '2',
            name: 'Pune Luxury Villas',
            status: 'active',
            platform: 'Facebook',
            budget: 100000,
            spent: 67800,
            leads: 280,
            cpl: 242,
            conversions: 52,
            conversionRate: 18.5,
        },
        {
            id: '3',
            name: 'Bangalore Tech City',
            status: 'paused',
            platform: 'Instagram',
            budget: 80000,
            spent: 45200,
            leads: 190,
            cpl: 238,
            conversions: 34,
            conversionRate: 17.9,
        },
    ];

    const teamPerformance = [
        { name: 'Rajesh Kumar', role: 'Ads Executive', campaigns: 5, leads: 580, avgCPL: 238 },
        { name: 'Priya Sharma', role: 'Creative Executive', campaigns: 4, leads: 420, avgCPL: 245 },
        { name: 'Amit Patel', role: 'Marketing Lead', campaigns: 3, leads: 250, avgCPL: 252 },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Marketing Dashboard</h1>
                <p className="text-gray-600 mt-1">Monitor campaigns, leads, and team performance</p>
            </div>

            {/* Time Range Selector */}
            <div className="mb-6 flex gap-2">
                {['7d', '30d', '90d', '1y'].map((range) => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${timeRange === range
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {range === '7d' && 'Last 7 Days'}
                        {range === '30d' && 'Last 30 Days'}
                        {range === '90d' && 'Last 90 Days'}
                        {range === '1y' && 'Last Year'}
                    </button>
                ))}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium">Active Campaigns</span>
                        <span className="text-2xl">📢</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.activeCampaigns}</div>
                    <div className="text-green-600 text-sm mt-1">+2 from last month</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium">Total Leads</span>
                        <span className="text-2xl">👥</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.totalLeads.toLocaleString()}</div>
                    <div className="text-green-600 text-sm mt-1">+12% from last month</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium">Cost Per Lead</span>
                        <span className="text-2xl">💰</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">₹{stats.costPerLead}</div>
                    <div className="text-green-600 text-sm mt-1">-8% from last month</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium">Conversion Rate</span>
                        <span className="text-2xl">📈</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</div>
                    <div className="text-green-600 text-sm mt-1">+2.3% from last month</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium">Budget Used</span>
                        <span className="text-2xl">💳</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.budgetUtilization}%</div>
                    <div className="text-gray-600 text-sm mt-1">
                        ₹{((stats.monthlyBudget * stats.budgetUtilization) / 100).toLocaleString()} / ₹
                        {stats.monthlyBudget.toLocaleString()}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium">Team Members</span>
                        <span className="text-2xl">👔</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">15</div>
                    <div className="text-gray-600 text-sm mt-1">5 Ads • 4 Creative • 6 Leads</div>
                </div>
            </div>

            {/* Campaign Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Campaign Performance</h2>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">
                            + New Campaign
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Campaign
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Platform
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Budget
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Leads
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    CPL
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Conv. Rate
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {campaigns.map((campaign) => (
                                <tr key={campaign.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{campaign.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                        >
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {campaign.platform}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div>₹{campaign.spent.toLocaleString()} / ₹{campaign.budget.toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">
                                            {Math.round((campaign.spent / campaign.budget) * 100)}% used
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {campaign.leads}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{campaign.cpl}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {campaign.conversionRate}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            <button className="text-purple-600 hover:text-purple-800 font-medium">Edit</button>
                                            <button className="text-gray-600 hover:text-gray-800 font-medium">
                                                {campaign.status === 'active' ? 'Pause' : 'Resume'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Team Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Team Performance</h2>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {teamPerformance.map((member, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{member.name}</div>
                                        <div className="text-sm text-gray-600">{member.role}</div>
                                    </div>
                                </div>
                                <div className="flex gap-8 text-sm">
                                    <div>
                                        <div className="text-gray-600">Campaigns</div>
                                        <div className="font-semibold text-gray-900">{member.campaigns}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Leads</div>
                                        <div className="font-semibold text-gray-900">{member.leads}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Avg CPL</div>
                                        <div className="font-semibold text-gray-900">₹{member.avgCPL}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
