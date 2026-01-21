'use client';

import { MOCK_DASHBOARD_STATS, MOCK_REGIONS, MOCK_ACTIVITY_LOGS } from '@/app/lib/mock-central-authority';
import Link from 'next/link';

export default function CentralAuthorityDashboardPage() {
    const stats = MOCK_DASHBOARD_STATS;
    const regions = MOCK_REGIONS;
    const activities = MOCK_ACTIVITY_LOGS;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
                <p className="text-gray-600 mt-2">Global statistics and performance metrics.</p>
            </div>

            {/* Global Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Total Regions</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalRegions}</p>
                    <p className="text-xs text-green-600 mt-1">Active across the globe</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Total Properties</h3>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-slate-900">{stats.properties.active + stats.properties.pending}</span>
                        <span className="text-sm text-gray-500 mb-1">({stats.properties.active} Active)</span>
                    </div>
                    <p className="text-xs text-orange-600 mt-1">{stats.properties.pending} Pending Approval</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                        {stats.users.builders + stats.users.consultants + stats.users.partners}
                    </p>
                    <div className="text-xs text-gray-500 mt-1 flex gap-2">
                        <span>{stats.users.builders} Property Partner</span>
                        <span>•</span>
                        <span>{stats.users.consultants} Cons</span>
                        <span>•</span>
                        <span>{stats.users.partners} CP</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Leads Generated</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.leads.monthly}</p>
                    <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Region Performance Table */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Regional Performance</h2>
                        <Link href="/super-admin/dashboard/regions" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            View All
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3">Region Name</th>
                                    <th className="px-6 py-3">Managers</th>
                                    <th className="px-6 py-3">Properties</th>
                                    <th className="px-6 py-3">Leads</th>
                                    <th className="px-6 py-3">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {regions.map((region) => (
                                    <tr key={region.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">{region.name}</td>
                                        <td className="px-6 py-4">{region.managers.join(', ')}</td>
                                        <td className="px-6 py-4">{region.propertiesCount}</td>
                                        <td className="px-6 py-4">{region.leadsGenerated}</td>
                                        <td className="px-6 py-4">
                                            <Link href={`/central-authority/dashboard/regions/${region.id}`} className="text-blue-600 hover:underline">
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h2>
                    <div className="space-y-4">
                        {activities.map((log) => (
                            <div key={log.id} className="flex gap-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${log.type === 'alert' ? 'bg-red-500' :
                                    log.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                                    }`} />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                    <p className="text-xs text-gray-500">{log.target} • {new Date(log.timestamp).toLocaleDateString('en-US')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <button className="w-full py-2 text-sm text-center text-gray-600 hover:text-gray-900 font-medium">
                            View Audit Log
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
