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
        {
            label: 'My Properties', value: '...', change: 'Inventory', icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ), color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', link: '/onboarding-manager/dashboard/properties'
        },
        {
            label: 'Listing Requests', value: '...', change: 'Review Required', icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ), color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', link: '/onboarding-manager/dashboard/listing-requests'
        },
        {
            label: 'Property Partners', value: '...', change: 'Managed', icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ), color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', link: '/onboarding-manager/dashboard/property-partners'
        },
        {
            label: 'Service Providers', value: '...', change: 'Active Networks', icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ), color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', link: '/onboarding-manager/dashboard/service-providers'
        },
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

                setStats(prev => [
                    { ...prev[0], value: properties.length.toString() },
                    { ...prev[1], value: pendingCount.toString() },
                    { ...prev[2], value: ((partners as any).data?.length || (partners as any).length || 0).toString() },
                    { ...prev[3], value: ((providers as any).data?.length || (providers as any).length || 0).toString() },
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
        { id: 1, action: 'Property Listed', subject: 'Villa 7A at North Mumbai', time: '2 hours ago', type: 'property', status: 'success' },
        { id: 2, action: 'Partner Verified', subject: 'Elite Builders Ltd.', time: '5 hours ago', type: 'partner', status: 'success' },
        { id: 3, action: 'Service Assigned', subject: 'Cleaning job for Tower 4', time: 'Yesterday', type: 'service', status: 'info' },
        { id: 4, action: 'System Update', subject: 'Region switching enabled', time: '2 days ago', type: 'system', status: 'success' },
    ];

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-12">
            {/* Adjusted Welcome Header - Blue Themed */}
            <header className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-10 overflow-hidden shadow-xl shadow-blue-100">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-[60px] -ml-24 -mb-24"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-white/20 text-blue-50 text-[10px] font-black uppercase tracking-[0.2em] rounded-full backdrop-blur-md border border-white/20">
                                Management Hub
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                            Welcome back, <span className="text-blue-100">{user?.name?.split(' ')[0] || 'Manager'}</span>
                        </h1>
                        <p className="mt-4 text-blue-100 text-lg flex items-center gap-2">
                            Overview for
                            <span className="px-3 py-1 bg-white/10 rounded-lg text-white font-bold border border-white/20">
                                {activeContext.activeRegion.city || activeContext.activeRegion.name}
                            </span>
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Link href="/onboarding-manager/dashboard/listing-requests" className="px-6 py-3 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 hover:scale-105 transition-all shadow-xl shadow-blue-900/10 flex items-center gap-3">
                            Review Requests
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Stats Cards Section - Already fits well */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Link href={stat.link} key={index} className="group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl shadow-inner group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
                        <div className="mt-2 flex items-baseline gap-3">
                            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">
                                {loading ? (
                                    <div className="w-16 h-10 bg-slate-100 animate-pulse rounded-xl"></div>
                                ) : stat.value}
                            </h3>
                            {!loading && <span className="text-xs font-bold text-emerald-500">+12%</span>}
                        </div>
                    </Link>
                ))}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-4">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">A</span>
                            Recent Activity
                        </h2>
                        <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">View All History</button>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="divide-y divide-slate-50">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-black/5 ${activity.type === 'property' ? 'bg-blue-50 text-blue-600' :
                                                activity.type === 'partner' ? 'bg-emerald-50 text-emerald-600' :
                                                    activity.type === 'service' ? 'bg-purple-50 text-purple-600' :
                                                        'bg-slate-50 text-slate-600'
                                                }`}>
                                                {activity.type === 'property' ? '🏠' : activity.type === 'partner' ? '🤝' : activity.type === 'service' ? '🔧' : '⚙️'}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{activity.action}</p>
                                                <p className="text-slate-500 font-medium">{activity.subject}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                                {activity.time}
                                            </span>
                                            <div className="flex justify-end">
                                                <span className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-blue-500'
                                                    }`}></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions Panel - Themed White/Blue */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 px-4">
                        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">Q</span>
                        Quick Actions
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { label: 'Review Requests', link: '/onboarding-manager/dashboard/listing-requests', icon: '📋', color: 'text-orange-600', bg: 'bg-orange-50' },
                            { label: 'Add New Property', link: '/onboarding-manager/dashboard/properties', icon: '🏢', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Register Partner', link: '/onboarding-manager/dashboard/property-partners', icon: '🤝', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Onboard Provider', link: '/onboarding-manager/dashboard/service-providers', icon: '🔧', color: 'text-purple-600', bg: 'bg-purple-50' },
                        ].map((action, i) => (
                            <Link key={i} href={action.link} className="group relative overflow-hidden bg-white rounded-[2rem] p-6 text-slate-900 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${action.bg} ${action.color} rounded-xl flex items-center justify-center text-xl`}>
                                            {action.icon}
                                        </div>
                                        <span className="font-bold tracking-tight text-slate-800">{action.label}</span>
                                    </div>
                                    <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Regional Performance Card - Adjusted Shadow */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-2 opacity-80 decoration-white/30 decoration-2">Region Health</h3>
                            <p className="text-4xl font-black mb-6">94%</p>
                            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mb-6">
                                <div className="h-full bg-white w-[94%] shadow-[0_0_12px_rgba(255,255,255,0.5)]"></div>
                            </div>
                            <p className="text-sm font-bold opacity-80 leading-relaxed">
                                Your region is performing exceptionally well! 12 new properties are in the pipeline.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}


