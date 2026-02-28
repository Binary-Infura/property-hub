'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { UnifiedAppProvider } from '@/app/contexts/UnifiedAppContext';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import RouteGuard from '@/app/components/auth/RouteGuard';
import ProfileCompletionPrompt from '@/app/components/ProfileCompletionPrompt';
import SidebarIcon from '@/app/components/SidebarIcon';

function CentralAuthorityDashboardLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/central-authority/dashboard', icon: 'dashboard' as const },
        { name: 'Consultants', href: '/central-authority/dashboard/consultants', icon: 'users' as const },
        { name: 'Loan Advisers', href: '/central-authority/dashboard/loan-advisers', icon: 'bank' as const },
        { name: 'Visit Executives', href: '/central-authority/dashboard/visit-executives', icon: 'car' as const },
        { name: 'Marketing Managers', href: '/central-authority/dashboard/marketing-managers', icon: 'megaphone' as const },
        { name: 'Onboarding Managers', href: '/central-authority/dashboard/onboarding-managers', icon: 'briefcase' as const },
        { name: 'Rera Scraper', href: '/central-authority/dashboard/rera-scraper', icon: 'spider' as const },
        { name: 'Influencers', href: '/central-authority/dashboard/influencers', icon: 'phone' as const },
        { name: 'Global Users', href: '/central-authority/dashboard/global-users', icon: 'globe' as const },
    ];

    const isActive = (href: string) => {
        if (href === '/central-authority/dashboard') {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-gray-800 flex flex-col shrink-0">
                <div className="h-16 flex items-center px-6 border-b border-gray-800">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
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
                                    ? 'bg-blue-600 text-white font-semibold'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <SidebarIcon name={item.icon} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <DashboardHeader title="Central Authority Dashboard" />

                <main className="flex-1 overflow-y-auto p-8">
                    <ProfileCompletionPrompt />
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function CentralAuthorityDashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <RouteGuard requiredRole="central-authority">
            <CentralAuthorityDashboardLayoutContent>{children}</CentralAuthorityDashboardLayoutContent>
        </RouteGuard>
    );
}
