'use client';

import { useState } from 'react';

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState('monthly');
    const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-01-31' });

    // Mock report data
    const reportSummary = {
        totalLeads: 1250,
        totalConversions: 231,
        totalSpent: 306500,
        avgCPL: 245,
        avgConversionRate: 18.5,
        roi: 2.3,
        topCampaign: 'Mumbai Premium Properties Q1',
        topPlatform: 'Google Ads',
    };

    const campaignReports = [
        { name: 'Mumbai Premium Properties Q1', leads: 420, conversions: 78, spent: 98500, cpl: 234, roi: 2.4 },
        { name: 'Pune Luxury Villas Campaign', leads: 280, conversions: 52, spent: 67800, cpl: 242, roi: 2.1 },
        { name: 'Bangalore Tech City', leads: 190, conversions: 34, spent: 45200, cpl: 238, roi: 1.9 },
        { name: 'Delhi NCR Apartments', leads: 360, conversions: 67, spent: 95000, cpl: 264, roi: 2.5 },
    ];

    const teamReports = [
        { name: 'Rajesh Kumar', role: 'Ads Executive', campaigns: 5, leads: 580, avgCPL: 238 },
        { name: 'Priya Sharma', role: 'Creative Executive', campaigns: 4, leads: 420, avgCPL: 245 },
        { name: 'Amit Patel', role: 'Marketing Lead', campaigns: 3, leads: 250, avgCPL: 252 },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Marketing Reports</h1>
                <p className="text-gray-600 mt-1">Generate and export marketing performance reports</p>
            </div>

            {/* Report Type Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Report Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                        <select
                            value={selectedReport}
                            onChange={(e) => setSelectedReport(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="monthly">Monthly Performance</option>
                            <option value="campaign">Campaign Breakdown</option>
                            <option value="team">Team Performance</option>
                            <option value="budget">Budget Utilization</option>
                            <option value="custom">Custom Report</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">
                        Generate Report
                    </button>
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                        Export PDF
                    </button>
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                        Export Excel
                    </button>
                    <button className="px-6 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition font-medium">
                        Share with Central Authority
                    </button>
                </div>
            </div>

            {/* Report Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600">{reportSummary.totalLeads.toLocaleString()}</div>
                        <div className="text-sm text-gray-600 mt-1">Total Leads</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">{reportSummary.totalConversions}</div>
                        <div className="text-sm text-gray-600 mt-1">Conversions</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">₹{reportSummary.totalSpent.toLocaleString()}</div>
                        <div className="text-sm text-gray-600 mt-1">Total Spent</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
                        <div className="text-3xl font-bold text-orange-600">₹{reportSummary.avgCPL}</div>
                        <div className="text-sm text-gray-600 mt-1">Avg CPL</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{reportSummary.avgConversionRate}%</div>
                        <div className="text-sm text-gray-600 mt-1">Avg Conversion Rate</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{reportSummary.roi}x</div>
                        <div className="text-sm text-gray-600 mt-1">ROI</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-semibold text-gray-900">{reportSummary.topCampaign}</div>
                        <div className="text-sm text-gray-600 mt-1">Top Campaign</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-semibold text-gray-900">{reportSummary.topPlatform}</div>
                        <div className="text-sm text-gray-600 mt-1">Top Platform</div>
                    </div>
                </div>
            </div>

            {/* Campaign Performance Report */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Campaign Performance Breakdown</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Campaign
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Leads
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Conversions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Spent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    CPL
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ROI
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {campaignReports.map((campaign, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{campaign.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{campaign.leads}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-green-600">{campaign.conversions}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">₹{campaign.spent.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">₹{campaign.cpl}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-green-600">{campaign.roi}x</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Team Performance Report */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Team Performance Report</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Team Member
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Campaigns
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Leads Generated
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Avg CPL
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {teamReports.map((member, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{member.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{member.role}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{member.campaigns}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{member.leads}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">₹{member.avgCPL}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
