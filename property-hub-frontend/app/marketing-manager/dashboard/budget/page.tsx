'use client';

import { useState } from 'react';

export default function BudgetPage() {
    const [timeRange, setTimeRange] = useState('current');

    // Mock data
    const budgetData = {
        totalBudget: 500000,
        allocated: 390000,
        spent: 306500,
        remaining: 193500,
    };

    const campaignAllocations = [
        { id: '1', name: 'Mumbai Premium Properties Q1', allocated: 150000, spent: 98500, leads: 420, cpl: 234 },
        { id: '2', name: 'Pune Luxury Villas Campaign', allocated: 100000, spent: 67800, leads: 280, cpl: 242 },
        { id: '3', name: 'Bangalore Tech City', allocated: 80000, spent: 45200, leads: 190, cpl: 238 },
        { id: '4', name: 'Delhi NCR Apartments', allocated: 60000, spent: 95000, leads: 360, cpl: 264 },
    ];

    const platformAllocations = [
        { platform: 'Google Ads', allocated: 200000, spent: 145000, leads: 650, roi: 2.4 },
        { platform: 'Facebook', allocated: 120000, spent: 89500, leads: 380, roi: 2.1 },
        { platform: 'Instagram', allocated: 70000, spent: 72000, leads: 220, roi: 1.8 },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Budget & Performance</h1>
                <p className="text-gray-600 mt-1">Track budget allocation and campaign performance</p>
            </div>

            {/* Time Range Selector */}
            <div className="mb-6 flex gap-2">
                {[
                    { value: 'current', label: 'Current Month' },
                    { value: 'last', label: 'Last Month' },
                    { value: 'quarter', label: 'This Quarter' },
                    { value: 'year', label: 'This Year' },
                ].map((range) => (
                    <button
                        key={range.value}
                        onClick={() => setTimeRange(range.value)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${timeRange === range.value
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {range.label}
                    </button>
                ))}
            </div>

            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Budget</div>
                    <div className="text-3xl font-bold text-gray-900">₹{budgetData.totalBudget.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Allocated</div>
                    <div className="text-3xl font-bold text-blue-600">₹{budgetData.allocated.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">
                        {Math.round((budgetData.allocated / budgetData.totalBudget) * 100)}% of total
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Spent</div>
                    <div className="text-3xl font-bold text-purple-600">₹{budgetData.spent.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">
                        {Math.round((budgetData.spent / budgetData.totalBudget) * 100)}% of total
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Remaining</div>
                    <div className="text-3xl font-bold text-green-600">₹{budgetData.remaining.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">
                        {Math.round((budgetData.remaining / budgetData.totalBudget) * 100)}% of total
                    </div>
                </div>
            </div>

            {/* Budget Utilization Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Budget Utilization</h2>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Allocated</span>
                            <span className="font-medium text-gray-900">
                                ₹{budgetData.allocated.toLocaleString()} ({Math.round((budgetData.allocated / budgetData.totalBudget) * 100)}%)
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-blue-500 h-3 rounded-full"
                                style={{ width: `${(budgetData.allocated / budgetData.totalBudget) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Spent</span>
                            <span className="font-medium text-gray-900">
                                ₹{budgetData.spent.toLocaleString()} ({Math.round((budgetData.spent / budgetData.totalBudget) * 100)}%)
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-purple-600 h-3 rounded-full"
                                style={{ width: `${(budgetData.spent / budgetData.totalBudget) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaign Budget Allocation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Campaign Budget Allocation</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Campaign
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Allocated
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Spent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Remaining
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Leads
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    CPL
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Utilization
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {campaignAllocations.map((campaign) => (
                                <tr key={campaign.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{campaign.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">₹{campaign.allocated.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">₹{campaign.spent.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        ₹{(campaign.allocated - campaign.spent).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{campaign.leads}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">₹{campaign.cpl}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${(campaign.spent / campaign.allocated) * 100 > 90
                                                            ? 'bg-red-500'
                                                            : (campaign.spent / campaign.allocated) * 100 > 75
                                                                ? 'bg-yellow-500'
                                                                : 'bg-green-500'
                                                        }`}
                                                    style={{ width: `${Math.min((campaign.spent / campaign.allocated) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-600 w-12">
                                                {Math.round((campaign.spent / campaign.allocated) * 100)}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Platform Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Platform Performance</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {platformAllocations.map((platform, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-6">
                                <h3 className="font-bold text-gray-900 mb-4">{platform.platform}</h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Budget</div>
                                        <div className="font-semibold text-gray-900">₹{platform.allocated.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Spent</div>
                                        <div className="font-semibold text-purple-600">₹{platform.spent.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Leads Generated</div>
                                        <div className="font-semibold text-gray-900">{platform.leads}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">ROI</div>
                                        <div className="font-semibold text-green-600">{platform.roi}x</div>
                                    </div>
                                    <div className="pt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-purple-600 h-2 rounded-full"
                                                style={{ width: `${Math.min((platform.spent / platform.allocated) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {Math.round((platform.spent / platform.allocated) * 100)}% utilized
                                        </div>
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
