'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MarketingManagerDashboardLayout({
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
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:text-purple-600">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg"></div>
                            PropertyHub Marketing Manager
                        </Link>
                        <div className="flex items-center gap-6">
                            <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Left Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16">
                    <nav className="p-4 space-y-2">
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

                {/* Main Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
