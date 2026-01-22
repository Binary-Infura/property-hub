'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CentralAuthorityDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/central-authority/dashboard', icon: '📊' },
        { name: 'Regions', href: '/central-authority/dashboard/regions', icon: '🌍' },
        { name: 'Regional Managers', href: '/central-authority/dashboard/regional-managers', icon: '👔' },
        { name: 'Marketing Managers', href: '/central-authority/dashboard/marketing-managers', icon: '📢' },
        { name: 'Commission Managers', href: '/central-authority/dashboard/commission-managers', icon: '💰' },
        { name: 'Global Users', href: '/central-authority/dashboard/users', icon: '👥' },
    ];

    const isActive = (href: string) => {
        if (href === '/central-authority/dashboard') {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-slate-900 text-white border-b border-gray-800 sticky top-0 z-50">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:text-blue-400 text-white">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">S</div>
                            PropertyHub Central Authority
                        </Link>
                        <div className="flex items-center gap-6">
                            <Link href="/" className="text-gray-300 hover:text-white text-sm font-medium">
                                Back to Home
                            </Link>
                            <div className="text-sm font-medium bg-slate-800 px-3 py-1 rounded-full">
                                Admin Mode
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Left Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16">
                    <nav className="p-4 space-y-2">
                        {navigation.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${active
                                        ? 'bg-slate-900 text-white font-semibold shadow-md'
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
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
