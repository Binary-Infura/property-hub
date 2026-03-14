'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { userService } from '@/app/services/userService';
import Link from 'next/link';
import SidebarIcon from '@/app/components/SidebarIcon';

export default function OnboardingDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState({
        totalPartners: 0,
        activePartners: 0,
        pendingRequests: 0,
        totalProjects: 0,
        totalLoanAdvisors: 0
    });
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchData = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const [partners, requests, projects, loanAdvisors] = await Promise.all([
                userService.getAllByRole('PROPERTY_PARTNER', token, true),
                fetch(`${API_URL}/api/ads-requests`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
                // For now, using a placeholder for projects or fetching from a real endpoint if available
                Promise.resolve({ total: 0 }),
                userService.getAllByRole('LOAN_ADVISOR', token, true)
            ]);

            setStats({
                totalPartners: partners.data?.length || 0,
                activePartners: partners.data?.filter((p: any) => p.status === 'active').length || 0,
                pendingRequests: Array.isArray(requests) ? requests.filter((r: any) => r.status === 'PENDING').length : 0,
                totalProjects: 0, // Placeholder
                totalLoanAdvisors: loanAdvisors.data?.length || 0
            });
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    if (loading) {
        return (
            <div className="p-8 text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-0 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Onboarding Dashboard</h1>
                    <p className="text-gray-600 mt-1">Overview of your operations and partner networking</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8 mt-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <SidebarIcon name="handshake" className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Property Partners</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.totalPartners}</h3>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-green-600 font-bold">{stats.activePartners} Active</span>
                        <Link href="/dashboard/property-partners" className="text-blue-600 hover:underline">View All</Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <SidebarIcon name="clipboard" className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Listing Requests</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</h3>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-orange-600 font-bold">Pending Approval</span>
                        <Link href="/dashboard/listing-requests" className="text-orange-600 hover:underline">Review Now</Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <SidebarIcon name="building" className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Projects Managed</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.totalProjects}</h3>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-600 font-bold">In Portfolio</span>
                        <Link href="/dashboard/project" className="text-emerald-600 hover:underline">Manage</Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <SidebarIcon name="star" className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Partner Reviews</p>
                            <h3 className="text-2xl font-bold text-gray-900">0</h3>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-purple-600 font-bold">User Feedback</span>
                        <Link href="/dashboard/reviews" className="text-purple-600 hover:underline">View</Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <SidebarIcon name="bank" className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loan Advisors</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.totalLoanAdvisors}</h3>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-indigo-600 font-bold">Finance Experts</span>
                        <Link href="/dashboard/loan-advisers" className="text-indigo-600 hover:underline">Manage</Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link 
                            href="/dashboard/property-partners" 
                            className="p-6 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-all group"
                        >
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:text-blue-600 transition-colors">
                                <SidebarIcon name="handshake" className="w-6 h-6" />
                            </div>
                            <p className="font-bold text-gray-900">Onboard Partner</p>
                            <p className="text-xs text-gray-500 mt-1">Add new property partner to platform</p>
                        </Link>
                        <Link 
                            href="/dashboard/project" 
                            className="p-6 bg-gray-50 rounded-2xl hover:bg-emerald-50 transition-all group"
                        >
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:text-emerald-600 transition-colors">
                                <SidebarIcon name="building" className="w-6 h-6" />
                            </div>
                            <p className="font-bold text-gray-900">Add Project</p>
                            <p className="text-xs text-gray-500 mt-1">Create new property listing</p>
                        </Link>
                        <Link 
                            href="/dashboard/loan-advisers" 
                            className="p-6 bg-gray-50 rounded-2xl hover:bg-indigo-50 transition-all group"
                        >
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:text-indigo-600 transition-colors">
                                <SidebarIcon name="bank" className="w-6 h-6" />
                            </div>
                            <p className="font-bold text-gray-900">Add Loan Advisor</p>
                            <p className="text-xs text-gray-500 mt-1">Onboard new loan advisor</p>
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-sm text-gray-500 italic">
                            No recent activity found.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
