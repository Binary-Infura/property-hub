'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RouteGuard from '@/app/components/auth/RouteGuard';
import SidebarIcon from '@/app/components/SidebarIcon';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';

export default function ServiceProviderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RouteGuard requiredRole="marketing-manager">
            {/* Note: In a real app we'd have a 'service-provider' role, using marketing-manager as a placeholder if service-provider isn't in Keycloak yet */}
            <ServiceProviderLayoutContent>{children}</ServiceProviderLayoutContent>
        </RouteGuard>
    );
}

function ServiceProviderLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { activeContext } = useUnifiedApp();

    const navigation = [
        { name: 'Dashboard', href: '/service-provider/dashboard', icon: 'dashboard' as const },
        { name: 'My Profile', href: '/service-provider/dashboard/profile', icon: 'person' as const },
        { name: 'Service Requests', href: '/service-provider/dashboard/requests', icon: 'clipboard' as const },
    ];

    const isActive = (href: string) => {
        if (href === '/service-provider/dashboard') {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <button className="md:hidden text-gray-400 hover:text-gray-900" onClick={() => setIsSidebarOpen(true)}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:text-blue-600">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                    <SidebarIcon name="wrench" className="w-5 h-5" />
                                </div>
                                Service Provider Portal
                            </Link>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-gray-900">Ramesh Gupta</p>
                                    <p className="text-xs text-gray-500">Painting Services</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">RG</div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile Sidebar overlay */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 z-40 md:hidden bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                )}

                {/* Left Sidebar */}
                <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 md:hidden">
                        <span className="font-bold text-lg">Menu</span>
                        <button className="text-gray-400 hover:text-gray-900" onClick={() => setIsSidebarOpen(false)}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${active
                                        ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600'
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

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
