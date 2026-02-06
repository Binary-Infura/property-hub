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



    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Marketing Reports</h1>
                <p className="text-gray-600 mt-1">Generate and export marketing performance reports</p>
            </div>

            {/* Report Type Selector */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 mb-8">
                <h2 className="text-xl font-extrabold text-gray-900 mb-6">Report Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Report Type</label>
                        <select
                            value={selectedReport}
                            onChange={(e) => setSelectedReport(e.target.value)}
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900 appearance-none"
                        >
                            <option value="monthly">Monthly Performance</option>
                            <option value="campaign">Campaign Breakdown</option>

                            <option value="budget">Budget Utilization</option>
                            <option value="custom">Custom Report</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900"
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button className="px-8 py-3.5 bg-[#a855f7] text-white rounded-2xl hover:bg-[#9333ea] shadow-lg shadow-purple-200 transition-all font-bold">
                        Generate Report
                    </button>
                    <button className="px-8 py-3.5 border-2 border-gray-100 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all font-bold">
                        Export PDF
                    </button>
                    <button className="px-8 py-3.5 border-2 border-gray-100 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all font-bold">
                        Export Excel
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


        </div>
    );
}
