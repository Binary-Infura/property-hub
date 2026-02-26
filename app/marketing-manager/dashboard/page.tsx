'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { marketingService } from '@/app/services/marketingService';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import NoAllocationPlaceholder from '@/app/components/dashboard/NoAllocationPlaceholder';

interface Campaign {
    id: string;
    name: string;
    description?: string;
    status: string;
    platform: string;
    budget: number;
    spent: number;
    startDate: string;
    endDate: string;
    targetCities: { id: string, name: string }[];
    assignedTo: { id: string, firstName: string, lastName: string }[];
    impressions: number;
    clicks: number;
    leadsCount: number;
    conversions: number;
    createdAt: string;
}

export default function MarketingManagerDashboard() {
    const { token } = useAuth();
    const { activeContext } = useUnifiedApp();
    const [timeRange, setTimeRange] = useState('30d');
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            if (!token) return;
            try {
                const data = await marketingService.getCampaigns(token);
                setCampaigns(data);
            } catch (error) {
                console.error("Failed to fetch campaigns:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, [token]);

    const activeCampaigns = campaigns.filter(c => c.status.toLowerCase() === 'active');
    const totalLeads = campaigns.reduce((sum, c) => sum + (c.leadsCount || 0), 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + Number(c.spent), 0);
    const totalBudget = campaigns.reduce((sum, c) => sum + Number(c.budget), 0);
    const avgCpl = totalLeads > 0 ? Math.round(totalSpent / totalLeads) : 0;
    const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
    const avgConvRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : '0';
    const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    if (loading) {
        return <div className="p-8 flex items-center justify-center min-h-screen">Loading dashboard...</div>;
    }

    if (!activeContext.activeCity) {
        return <NoAllocationPlaceholder />;
    }

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
                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{activeCampaigns.length}</div>
                    <div className="text-green-600 text-sm mt-1">Total: {campaigns.length}</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium">Total Leads</span>
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{totalLeads.toLocaleString()}</div>
                    <div className="text-green-600 text-sm mt-1">Overall performance</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium">Cost Per Lead</span>
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">₹{avgCpl}</div>
                    <div className="text-gray-600 text-sm mt-1">Weighted average</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium">Conversion Rate</span>
                        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{avgConvRate}%</div>
                    <div className="text-gray-600 text-sm mt-1">Leads to Conversions</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium">Budget Used</span>
                        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{budgetUtilization}%</div>
                    <div className="text-gray-600 text-sm mt-1">
                        ₹{totalSpent.toLocaleString()} / ₹{totalBudget.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Campaign Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Campaign Performance</h2>
                        <Link
                            href="/marketing-manager/dashboard/campaigns?action=create"
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                        >
                            + New Campaign
                        </Link>
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
                                            className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${campaign.status.toLowerCase() === 'active'
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
                                        <div>₹{Number(campaign.spent).toLocaleString()} / ₹{Number(campaign.budget).toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">
                                            {Math.round((Number(campaign.spent) / Number(campaign.budget)) * 100)}% used
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {campaign.leadsCount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₹{campaign.leadsCount > 0 ? Math.round(Number(campaign.spent) / campaign.leadsCount) : 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {campaign.clicks > 0 ? ((campaign.conversions / campaign.clicks) * 100).toFixed(1) : 0}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            <button className="text-purple-600 hover:text-purple-800 font-medium">Edit</button>
                                            <button className="text-gray-600 hover:text-gray-800 font-medium">
                                                {campaign.status.toLowerCase() === 'active' ? 'Pause' : 'Resume'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
