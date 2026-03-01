'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import RouteGuard from '@/app/components/auth/RouteGuard';
import SidebarIcon from '@/app/components/SidebarIcon';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';

function OnboardingManagerLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { activeContext } = useUnifiedApp();

    const navigation = [
        { name: 'Broker Partners', href: '/onboarding-manager/dashboard', icon: 'handshake' as const },
        { name: 'Project', href: '/onboarding-manager/dashboard/project', icon: 'building' as const },
        { name: 'Listing Requests', href: '/onboarding-manager/dashboard/listing-requests', icon: 'clipboard' as const },
        { name: 'Property Partners', href: '/onboarding-manager/dashboard/property-partners', icon: 'handshake' as const },
        { name: 'Service Providers', href: '/onboarding-manager/dashboard/service-providers', icon: 'wrench' as const },
    ];

    const isActive = (href: string) => {
        if (href === '/onboarding-manager/dashboard' && pathname === href) return true;
        if (href !== '/onboarding-manager/dashboard' && pathname.startsWith(href)) return true;
        return false;
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Sidebar overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            )}

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
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.href)
                                ? 'bg-blue-50 text-blue-600 font-medium shadow-sm border-l-4 border-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 group'
                                }`}
                        >
                            <SidebarIcon name={item.icon} />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
                <DashboardHeader title="Onboarding Manager Dashboard" onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function OnboardingManagerLayout({ children }: { children: React.ReactNode }) {
    return (
        <RouteGuard requiredRole="onboarding-manager">
            <OnboardingManagerLayoutContent>{children}</OnboardingManagerLayoutContent>
        </RouteGuard>
    );
}
