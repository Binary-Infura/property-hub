'use client';

import { UnifiedAppProvider } from '@/app/contexts/UnifiedAppContext';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RouteGuard from '@/app/components/auth/RouteGuard';

import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import NoAllocationPlaceholder from '@/app/components/dashboard/NoAllocationPlaceholder';
import ProfileCompletionPrompt from '@/app/components/ProfileCompletionPrompt';

function MarketingManagerDashboardLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { activeContext } = useUnifiedApp();

    const navigation = [
        { name: 'Dashboard', href: '/marketing-manager/dashboard', icon: '📊' },
        { name: 'Campaigns', href: '/marketing-manager/dashboard/campaigns', icon: '📢' },
        { name: 'Campaign Leads', href: '/marketing-manager/dashboard/leads', icon: '👥' },
        { name: 'Ads Requests', href: '/marketing-manager/dashboard/ads-requests', icon: '📝' },
        { name: 'Budget & Performance', href: '/marketing-manager/dashboard/budget', icon: '💰' },
        { name: 'Reports', href: '/marketing-manager/dashboard/reports', icon: '📈' },
    ];

    const isActive = (href: string) => {
        if (href === '/marketing-manager/dashboard') {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    const isNoAllocation = activeContext.activeRegion.id === 'no-region' || activeContext.activeRegion.id === 'all-regions';

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            {!isNoAllocation && (
                <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
                    <div className="h-16 flex items-center px-6 border-b border-gray-100">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                            <span>PropertyHub</span>
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
                                        ? 'bg-purple-50 text-purple-700 font-semibold border-l-4 border-purple-600'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <DashboardHeader title="Marketing Manager Dashboard" showLogo={isNoAllocation} />

                <main className={`flex-1 overflow-y-auto ${isNoAllocation ? 'flex items-center justify-center p-8' : 'p-8'}`}>
                    <ProfileCompletionPrompt />
                    {isNoAllocation ? <NoAllocationPlaceholder /> : children}
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
