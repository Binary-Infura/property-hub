'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { reraService } from '@/app/services/reraService';
import Link from 'next/link';
import ReraImportSection from '@/app/components/dashboard/ReraImportSection';
import BankManagerSection from '@/app/components/dashboard/BankManagerSection';

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
    createdAt?: string;
    propertyPartnerProfile: {
        isPremium: boolean;
        subscriptionMode: 'PAID' | 'FREE';
        companyName?: string;
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
    const [districtSearch, setDistrictSearch] = useState('');
    const [showReraImport, setShowReraImport] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchPartners = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/api/central-authority/property-partners`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPartners(data);
            }
        } catch (error) {
            console.error('Failed to fetch partners:', error);
        }
    };


    const fetchDistrictCounts = async (search?: string) => {
        if (!token) return;
        setFetchingCounts(true);
        try {
            const counts = await reraService.getDistrictCounts(token, undefined, search);
            setDistrictCounts(counts);
        } catch (error) {
            console.error('Failed to fetch district counts:', error);
        } finally {
            setFetchingCounts(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchDistrictCounts(districtSearch);
        }
    }, [token, districtSearch]);

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

            {/* Onboarded Property Partners */}
            <div className="grid grid-cols-1 gap-6">

                {/* Property Partner Management Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Property Partners</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {partners.length} onboarded &bull; latest subscriptions
                            </p>
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
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Agency</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {partners.slice(0, 5).map((partner) => {
                                    const isPremium = partner.propertyPartnerProfile?.isPremium || false;
                                    const mode = partner.propertyPartnerProfile?.subscriptionMode || 'PAID';

                                    return (
                                        <tr key={partner.id} className="text-sm group hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-gray-900">{partner.firstName} {partner.lastName}</p>
                                                <p className="text-xs text-gray-400">{partner.email}</p>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 text-xs">
                                                {partner.propertyPartnerProfile?.companyName || partner.agencyName || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    {isPremium ? (
                                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit">Premium</span>
                                                    ) : (
                                                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit">Standard</span>
                                                    )}
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit ${mode === 'FREE' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {mode}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {!isPremium ? (
                                                    <button
                                                        onClick={() => handleUpdateSubscription(partner.id, true, 'FREE')}
                                                        disabled={updatingPartner === partner.id}
                                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                                    >
                                                        {updatingPartner === partner.id ? 'Updating...' : 'Gift Premium'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUpdateSubscription(partner.id, false, 'PAID')}
                                                        disabled={updatingPartner === partner.id}
                                                        className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-50"
                                                    >
                                                        {updatingPartner === partner.id ? 'Updating...' : 'Revoke'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {partners.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic text-sm">
                                            No property partners onboarded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {partners.length > 5 && (
                        <div className="mt-4 pt-4 border-t border-gray-50 text-center">
                            <Link href="/central-authority/dashboard/property-partners" className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider">
                                +{partners.length - 5} more partners
                            </Link>
                        </div>
                    )}
                </div>

            </div>


            {/* RERA District-wise Counts Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">RERA District-wise Projects</h2>
                        <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-gray-500">Total registered projects per district (from RERA portals)</p>
                            <div className="h-4 w-[1px] bg-gray-200"></div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Filter district..."
                                    value={districtSearch}
                                    onChange={(e) => setDistrictSearch(e.target.value)}
                                    className="text-xs border border-gray-200 rounded-full px-3 py-1 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all w-40"
                                />
                                {districtSearch && (
                                    <button
                                        onClick={() => setDistrictSearch('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowReraImport(!showReraImport)}
                            className={`text-sm font-semibold flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${showReraImport
                                ? 'bg-orange-50 text-orange-600 border border-orange-100'
                                : 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
                                }`}
                        >
                            <svg className={`w-4 h-4 transition-transform ${showReraImport ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {showReraImport ? 'Close Importer' : 'Import RERA Data'}
                        </button>
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
                </div>

                {showReraImport && (
                    <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-top-4 duration-300">
                        <ReraImportSection />
                    </div>
                )}

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

            {/* Bank Management Section */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <BankManagerSection />
            </div>

            {/* Property Management Quick Access */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Link href="/central-authority/dashboard/reviews" className="block bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-yellow-300 transition-all hover:shadow-md group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                            <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">Review Governance</h3>
                            <p className="text-xs text-gray-500">Control review visibility</p>
                        </div>
                    </div>
                    <div className="text-xs font-semibold text-yellow-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Manage Reviews
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>

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

                <Link href="/central-authority/dashboard/ads-requests" className="block bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-purple-300 transition-all hover:shadow-md group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Ads Requests</h3>
                            <p className="text-xs text-gray-500">Manage builder advertising</p>
                        </div>
                    </div>
                    <div className="text-xs font-semibold text-purple-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Ads Requests
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>

                <Link href="/central-authority/dashboard/system-call-records" className="block bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-orange-300 transition-all hover:shadow-md group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">Call Records</h3>
                            <p className="text-xs text-gray-500">Monitor system communication</p>
                        </div>
                    </div>
                    <div className="text-xs font-semibold text-orange-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View System Calls
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
