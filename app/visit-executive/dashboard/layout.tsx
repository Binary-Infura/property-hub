'use client';

import { UnifiedAppProvider } from '@/app/contexts/UnifiedAppContext';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import RouteGuard from '@/app/components/auth/RouteGuard';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SidebarIcon from '@/app/components/SidebarIcon';

import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import NoAllocationPlaceholder from '@/app/components/dashboard/NoAllocationPlaceholder';

function VisitExecutiveDashboardLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { activeContext } = useUnifiedApp();

    const navigation = [
        { name: 'Dashboard', href: '/visit-executive/dashboard', icon: 'dashboard' as const },
        { name: 'Schedule', href: '/visit-executive/dashboard/schedule', icon: 'calendar' as const },
        { name: 'My Visits', href: '/visit-executive/dashboard/visits', icon: 'pin' as const },
        { name: 'Clients', href: '/visit-executive/dashboard/clients', icon: 'users' as const },
    ];

    const isActive = (href: string) => {
        if (href === '/visit-executive/dashboard') {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };


    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            {activeContext.activeCity && (
                <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
                    <div className="h-16 flex items-center px-6 border-b border-gray-100">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                            <span>Visit Executive</span>
                        </Link>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <DashboardHeader
                    title="Visit Executive Dashboard"
                />

                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function VisitExecutiveDashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <RouteGuard requiredRole="visit-executive">
            <VisitExecutiveDashboardLayoutContent>{children}</VisitExecutiveDashboardLayoutContent>
        </RouteGuard>
    );
}
