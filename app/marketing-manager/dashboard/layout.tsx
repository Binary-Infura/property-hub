'use client';

import React, { useState } from 'react';
import { UnifiedAppProvider } from '@/app/contexts/UnifiedAppContext';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RouteGuard from '@/app/components/auth/RouteGuard';
import SidebarIcon from '@/app/components/SidebarIcon';

import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import ProfileCompletionPrompt from '@/app/components/ProfileCompletionPrompt';

function MarketingManagerDashboardLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { activeContext } = useUnifiedApp();

    const navigation = [
        { name: 'Dashboard', href: '/marketing-manager/dashboard', icon: 'dashboard' as const },
        { name: 'Campaigns', href: '/marketing-manager/dashboard/campaigns', icon: 'megaphone' as const },
        { name: 'Campaign Leads', href: '/marketing-manager/dashboard/leads', icon: 'users' as const },
        { name: 'Ads Requests', href: '/marketing-manager/dashboard/ads-requests', icon: 'note' as const },
        { name: 'Budget & Performance', href: '/marketing-manager/dashboard/budget', icon: 'money' as const },
        { name: 'Reports', href: '/marketing-manager/dashboard/reports', icon: 'chart' as const },
    ];

    const isActive = (href: string) => {
        if (href === '/marketing-manager/dashboard') {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };


    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Mobile Sidebar overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 md:relative md:flex flex-col shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                        <span>PropertyHub</span>
                    </Link>
                    <button className="md:hidden text-gray-400 hover:text-gray-900" onClick={() => setIsSidebarOpen(false)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${active
                                    ? 'bg-purple-50 text-purple-700 font-semibold border-l-4 border-purple-600'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <SidebarIcon name={item.icon} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
                <DashboardHeader title="Marketing Manager Dashboard" onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <ProfileCompletionPrompt />
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function MarketingManagerDashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <RouteGuard requiredRole="marketing-manager">
            <MarketingManagerDashboardLayoutContent>{children}</MarketingManagerDashboardLayoutContent>
        </RouteGuard>
    );
}
