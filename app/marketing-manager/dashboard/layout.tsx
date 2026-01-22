'use client';

import { UnifiedAppProvider } from '@/app/contexts/UnifiedAppContext';
import InternalDashboardHeader from '@/app/components/dashboard/InternalDashboardHeader';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function MarketingManagerDashboardLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/marketing-manager/dashboard', icon: '📊' },
        { name: 'Campaigns', href: '/marketing-manager/dashboard/campaigns', icon: '📢' },
        {
            name: 'Team Management',
            icon: '👥',
            submenu: [
                { name: 'Ads Executives', href: '/marketing-manager/dashboard/ads-executives', icon: '📱' },
                { name: 'Creative Executives', href: '/marketing-manager/dashboard/creative-executives', icon: '🎨' },
                { name: 'Marketing Leads', href: '/marketing-manager/dashboard/marketing-leads', icon: '👔' },
            ]
        },
        { name: 'Budget & Performance', href: '/marketing-manager/dashboard/budget', icon: '💰' },
        { name: 'Reports', href: '/marketing-manager/dashboard/reports', icon: '📈' },
    ];

    const isActive = (href: string) => {
        if (href === '/marketing-manager/dashboard') {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                        <span>PropertyHub</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        if (item.submenu) {
                            return (
                                <div key={item.name} className="space-y-1">
                                    <div className="flex items-center gap-3 px-4 py-3 text-gray-700 font-semibold">
                                        <span className="text-xl">{item.icon}</span>
                                        <span>{item.name}</span>
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        {item.submenu.map((subItem) => {
                                            const active = isActive(subItem.href);
                                            return (
                                                <Link
                                                    key={subItem.name}
                                                    href={subItem.href}
                                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${active
                                                        ? 'bg-purple-50 text-purple-700 font-semibold border-l-4 border-purple-600'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className="text-lg">{subItem.icon}</span>
                                                    <span>{subItem.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }

                        const active = isActive(item.href!);
                        return (
                            <Link
                                key={item.name}
                                href={item.href!}
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

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <InternalDashboardHeader title="Marketing Manager Dashboard" />

                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function MarketingManagerDashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <UnifiedAppProvider>
            <MarketingManagerDashboardLayoutContent>{children}</MarketingManagerDashboardLayoutContent>
        </UnifiedAppProvider>
    );
}
