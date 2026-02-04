'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { propertyService } from '@/app/services/propertyService';
import { userService } from '@/app/services/userService';
import Link from 'next/link';

export default function OnboardingManagerDashboard() {
    const { user, token } = useAuth();
    const { activeContext } = useUnifiedApp();
    const [stats, setStats] = useState([
        { label: 'Total Properties', value: '...', change: '', icon: '🏢', color: 'bg-blue-50 text-blue-600', link: '/onboarding-manager/dashboard/properties' },
        { label: 'Listing Requests', value: '...', change: '', icon: '📋', color: 'bg-orange-50 text-orange-600', link: '/onboarding-manager/dashboard/listing-requests' },
        { label: 'Property Partners', value: '...', change: '', icon: '🤝', color: 'bg-green-50 text-green-600', link: '/onboarding-manager/dashboard/property-partners' },
        { label: 'Service Providers', value: '...', change: '', icon: '🔧', color: 'bg-purple-50 text-purple-600', link: '/onboarding-manager/dashboard/service-providers' },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token || activeContext.activeRegion.code === 'no-region') {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const regionCode = activeContext.activeRegion.code;

                const [properties, partners, providers, allProperties] = await Promise.all([
                    propertyService.getAll(token, regionCode, true),
                    userService.getAllByRole('property-partner', token, regionCode, true),
                    userService.getAllByRole('service-provider', token, regionCode, true),
                    propertyService.getAll(token, regionCode, false, activeContext.activeRegion.city),
                ]);

                const pendingCount = allProperties.filter((p: any) => p.status === 'SUBMITTED').length;

                setStats([
                    { label: 'My Properties', value: properties.length.toString(), change: 'Total', icon: '🏢', color: 'bg-blue-50 text-blue-600', link: '/onboarding-manager/dashboard/properties' },
                    { label: 'Listing Requests', value: pendingCount.toString(), change: 'Pending Review', icon: '📋', color: 'bg-orange-50 text-orange-600', link: '/onboarding-manager/dashboard/listing-requests' },
                    { label: 'Property Partners', value: (partners as any).data?.length || (partners as any).length || 0, change: 'Active', icon: '🤝', color: 'bg-green-50 text-green-600', link: '/onboarding-manager/dashboard/property-partners' },
                    { label: 'Service Providers', value: (providers as any).data?.length || (providers as any).length || 0, change: 'Verified', icon: '🔧', color: 'bg-purple-50 text-purple-600', link: '/onboarding-manager/dashboard/service-providers' },
                ]);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token, activeContext.activeRegion.code, activeContext.activeRegion.city]);

    const recentActivities = [
        { id: 1, action: 'Live Integration', subject: 'Dashboard now connected to real data', time: 'Just now', status: 'success' },
        { id: 2, action: 'City Filter', subject: `Showing data for ${activeContext.activeRegion.city || activeContext.activeRegion.name}`, time: 'Active', status: 'success' },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 text-white">Welcome back, {user?.name?.split(' ')[0] || 'Manager'}! 👋</h1>
                    <p className="text-blue-100 text-lg">Here's what's happening in <span className="font-bold underline text-white">{activeContext.activeRegion.city || activeContext.activeRegion.name}</span> today.</p>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Link href={stat.link} key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-4 rounded-xl ${stat.color} text-3xl group-hover:scale-110 transition-transform shadow-inner`}>
                                {stat.icon}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wide">{stat.label}</h3>
                        <p className="text-4xl font-black text-gray-900 mt-2">{loading ? '...' : stat.value}</p>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:col-span-3 gap-8">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        <span className="p-2 bg-yellow-100 rounded-lg text-yellow-600 text-sm">⚡</span> Quick Actions
                    </h2>
                    <div className="space-y-4">
                        <Link href="/onboarding-manager/dashboard/listing-requests" className="w-full flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl hover:bg-orange-600 hover:text-white transition-all group border border-transparent hover:border-orange-700 shadow-sm">
                            <span className="font-bold text-gray-700 group-hover:text-white">Review Listing Requests</span>
                            <span className="text-gray-400 group-hover:text-white text-xl">→</span>
                        </Link>
                        <Link href="/onboarding-manager/dashboard/properties" className="w-full flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all group border border-transparent hover:border-blue-700 shadow-sm">
                            <span className="font-bold text-gray-700 group-hover:text-white">Onboard New Property</span>
                            <span className="text-gray-400 group-hover:text-white text-xl">→</span>
                        </Link>
                        <Link href="/onboarding-manager/dashboard/property-partners" className="w-full flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl hover:bg-green-600 hover:text-white transition-all group border border-transparent hover:border-green-700 shadow-sm">
                            <span className="font-bold text-gray-700 group-hover:text-white">Add Property Partner</span>
                            <span className="text-gray-400 group-hover:text-white text-xl">→</span>
                        </Link>
                        <Link href="/onboarding-manager/dashboard/service-providers" className="w-full flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl hover:bg-purple-600 hover:text-white transition-all group border border-transparent hover:border-purple-700 shadow-sm">
                            <span className="font-bold text-gray-700 group-hover:text-white">Onboard Provider</span>
                            <span className="text-gray-400 group-hover:text-white text-xl">→</span>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600 text-sm">📋</span> Recent Activity
                        </h2>
                        <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">View History</span>
                    </div>
                    <div className="space-y-2">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition rounded-2xl group">
                                <div className="flex items-center gap-5">
                                    <div className={`w-3 h-3 rounded-full shadow-sm ${activity.status === 'success' ? 'bg-green-500 animate-pulse' :
                                        activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                        }`} />
                                    <div>
                                        <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{activity.action}</p>
                                        <p className="text-sm text-gray-500 font-medium">{activity.subject}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full tracking-tighter">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

