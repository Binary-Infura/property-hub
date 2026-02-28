'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';

interface DashboardStats {
    projects: {
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
    cities: Array<{
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

interface PropertyPartner {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    agencyName: string;
    propertyPartnerProfile: {
        isPremium: boolean;
        subscriptionMode: 'PAID' | 'FREE';
    } | null;
}

export default function CentralAuthorityDashboardPage() {
    const { token } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [partners, setPartners] = useState<PropertyPartner[]>([]);
    const [districtCounts, setDistrictCounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingPartner, setUpdatingPartner] = useState<string | null>(null);
    const [fetchingCounts, setFetchingCounts] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchPartners = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/api/central-authority/property-partners`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setPartners(data);
            }
        } catch (error) {
            console.error('Failed to fetch partners:', error);
        }
    };

    const fetchDistrictCounts = async () => {
        if (!token) return;
        setFetchingCounts(true);
        try {
            const response = await fetch(`${API_URL}/rera/district-counts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setDistrictCounts(data);
            }
        } catch (error) {
            console.error('Failed to fetch district counts:', error);
        } finally {
            setFetchingCounts(false);
        }
    };

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
        fetchPartners();
        fetchDistrictCounts();
    }, [token, API_URL]);

    const handleUpdateSubscription = async (userId: string, isPremium: boolean, mode: 'PAID' | 'FREE') => {
        setUpdatingPartner(userId);
        try {
            const response = await fetch(`${API_URL}/api/central-authority/property-partners/${userId}/subscription`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isPremium, subscriptionMode: mode })
            });

            if (response.ok) {
                await fetchPartners();
            } else {
                alert('Failed to update subscription');
            }
        } catch (error) {
            console.error('Error updating subscription:', error);
            alert('Error updating subscription');
        } finally {
            setUpdatingPartner(null);
        }
    };

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

                <Link href="/central-authority/dashboard/properties" className="block bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 transition-all hover:shadow-md group">
                    <h3 className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">Total Projects</h3>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-slate-900">{stats.projects.total}</span>
                        <span className="text-sm text-gray-500 mb-1">({stats.projects.active} Active)</span>
                    </div>
                    <p className="text-xs text-orange-600 mt-1">{stats.projects.pending} Pending Approval</p>
                    <div className="mt-4 text-xs font-semibold text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View All Properties
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>

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

            {/* Property Partner Management Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Recent Property Partners</h2>
                        <p className="text-sm text-gray-500 mt-1">Latest subscriptions and premium status</p>
                    </div>
                    <Link
                        href="/central-authority/dashboard/property-partners"
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                        View All
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <th className="px-4 py-3">Partner Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Agency</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Mode</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {partners.slice(0, 5).map((partner) => {
                                const isPremium = partner.propertyPartnerProfile?.isPremium || false;
                                const mode = partner.propertyPartnerProfile?.subscriptionMode || 'PAID';

                                return (
                                    <tr key={partner.id} className="text-sm group hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 font-bold text-gray-900">
                                            {partner.firstName} {partner.lastName}
                                        </td>
                                        <td className="px-4 py-4 text-gray-600">{partner.email}</td>
                                        <td className="px-4 py-4 text-gray-600">{partner.agencyName || '-'}</td>
                                        <td className="px-4 py-4">
                                            {isPremium ? (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase">Premium</span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-[10px] font-bold uppercase">Standard</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${mode === 'FREE' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {mode}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            {!isPremium ? (
                                                <button
                                                    onClick={() => handleUpdateSubscription(partner.id, true, 'FREE')}
                                                    disabled={updatingPartner === partner.id}
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                                >
                                                    {updatingPartner === partner.id ? 'Updating...' : 'Mark Free Premium'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleUpdateSubscription(partner.id, false, 'PAID')}
                                                    disabled={updatingPartner === partner.id}
                                                    className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-50"
                                                >
                                                    {updatingPartner === partner.id ? 'Updating...' : 'Revoke Premium'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {partners.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 italic">
                                        No property partners found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* RERA District-wise Counts Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">RERA District-wise Projects</h2>
                        <p className="text-sm text-gray-500 mt-1">Total registered projects per district (from RERA portals)</p>
                    </div>
                    <Link
                        href="/central-authority/dashboard/rera-counts"
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                        View Details
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                <div className="overflow-x-auto min-h-[200px]">
                    {fetchingCounts ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="px-4 py-3">District Name</th>
                                    <th className="px-4 py-3">State</th>
                                    <th className="px-4 py-3 text-center">Project Count</th>
                                    <th className="px-4 py-3 text-right">Last Updated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {districtCounts.slice(0, 5).map((item) => (
                                    <tr key={item.id} className="text-sm group hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 font-bold text-gray-900">
                                            {item.district}
                                        </td>
                                        <td className="px-4 py-4 text-gray-600">{item.state}</td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-lg">
                                                {item.projectCount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right text-gray-400 text-xs">
                                            {new Date(item.updatedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {districtCounts.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500 italic">
                                            No RERA data synchronized yet. Go to scraper to sync.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                {districtCounts.length > 5 && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                        <Link
                            href="/central-authority/dashboard/rera-counts"
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider flex items-center justify-center gap-1"
                        >
                            View All {districtCounts.length} Districts
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>
                )}
            </div>

            {/* Property Management Quick Access */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/central-authority/dashboard/properties/allocation" className="block bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 transition-all hover:shadow-md group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Project Allocation</h3>
                            <p className="text-xs text-gray-500">Assign projects to consultants</p>
                        </div>
                    </div>
                    <div className="text-xs font-semibold text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Start Allocating
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>

                <Link href="/central-authority/dashboard/commissions" className="block bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-green-300 transition-all hover:shadow-md group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Commissions</h3>
                            <p className="text-xs text-gray-500">Manage & approve commissions</p>
                        </div>
                    </div>
                    <div className="text-xs font-semibold text-green-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View All Commissions
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>
            </div>



            {/* Recent Activity Feed */}
            <div className="max-w-2xl">
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
                        <Link href="/central-authority/dashboard/audit-log" className="block w-full py-2.5 bg-gray-50 text-xs text-center text-gray-500 hover:text-gray-900 font-bold uppercase tracking-[0.2em] rounded-lg transition-all hover:bg-gray-100 active:scale-95">
                            View Audit Log
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
