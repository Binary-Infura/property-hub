'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';

interface DashboardStats {
    totalRegions: number;
    properties: {
        total: number;
        active: number;
        pending: number;
    };
    users: {
        total: number;
        partners: number;
        consultants: number;
        channelPartners: number;
    };
    leads: {
        monthly: number;
    };
    totalPostalCodes: number;
    regions: Array<{
        id: string;
        name: string;
        managers: string[];
        propertiesCount: number;
        leadsGenerated: number;
    }>;
    recentActivity: Array<{
        id: string;
        type: string;
        action: string;
        target: string;
        timestamp: string;
    }>;
}

export default function CentralAuthorityDashboardPage() {
    const { token } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            try {
                const response = await fetch(`${API_URL}/api/central-authority/dashboard-stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token, API_URL]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
                <p className="text-gray-600 mt-2">Global statistics and performance metrics.</p>
            </div>

            {/* Global Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Total Properties</h3>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-slate-900">{stats.properties.total}</span>
                        <span className="text-sm text-gray-500 mb-1">({stats.properties.active} Active)</span>
                    </div>
                    <p className="text-xs text-orange-600 mt-1">{stats.properties.pending} Pending Approval</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                        {stats.users.total}
                    </p>
                    <div className="text-xs text-gray-500 mt-1 flex gap-2">
                        <span>{stats.users.partners} Property Partner</span>
                        <span>•</span>
                        <span>{stats.users.consultants} Cons</span>
                        <span>•</span>
                        <span>{stats.users.channelPartners} CP</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 font-bold group">
                    <h3 className="text-sm font-medium text-gray-500">Leads Generated</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.leads.monthly}</p>
                    <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                </div>

                <Link href="/central-authority/dashboard/postal-codes" className="block bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 transition-all hover:shadow-md group">
                    <h3 className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">Postal Codes</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalPostalCodes.toLocaleString()}</p>
                    <p className="text-xs text-blue-600 mt-1">Manage platform postal data</p>
                    <div className="mt-4 text-xs font-semibold text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>
            </div>


            {/* City Allocation & Recent Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* City Allocation Table */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">City Allocation</h2>
                        <Link href="/central-authority/dashboard/city-allocation" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            View All
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-[#F8FAFC] text-gray-400 font-bold text-[10px] uppercase tracking-[0.1em] border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">City Name</th>
                                    <th className="px-6 py-4 text-center">Pending Properties</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[
                                    { name: 'Mumbai', pending: 12 },
                                    { name: 'Pune', pending: 8 },
                                    { name: 'Bangalore', pending: 15 },
                                    { name: 'Hyderabad', pending: 10 },
                                    { name: 'Delhi', pending: 20 },
                                ].map((city, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                                        <td className="px-6 py-4 font-semibold text-gray-900">{city.name}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-100">
                                                {city.pending} units
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href="/central-authority/dashboard/city-allocation" className="text-blue-600 hover:underline text-xs font-bold uppercase tracking-tighter">
                                                Manage
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
                        {stats.recentActivity.map((log) => (
                            <div key={log.id} className="flex gap-4 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-white transition-colors cursor-default group">
                                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${log.type === 'alert' ? 'bg-red-500' :
                                    log.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                                    } group-hover:scale-125 transition-transform`} />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-tight">{log.action}</p>
                                    <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-medium">{log.target} • {new Date(log.timestamp).toLocaleDateString('en-US')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <button className="w-full py-2.5 bg-gray-50 text-xs text-center text-gray-500 hover:text-gray-900 font-bold uppercase tracking-[0.2em] rounded-lg transition-all hover:bg-gray-100 active:scale-95">
                            View Audit Log
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
