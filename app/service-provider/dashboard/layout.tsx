'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ServiceProviderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/service-provider/dashboard', icon: '📊' },
        { name: 'My Profile', href: '/service-provider/dashboard/profile', icon: '👤' },
        { name: 'Service Requests', href: '/service-provider/dashboard/requests', icon: '📨' },
    ];

    const isActive = (href: string) => {
        if (href === '/service-provider/dashboard') {
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
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:text-blue-600">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">🛠️</div>
                            Service Provider Portal
                        </Link>
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

            <div className="flex">
                {/* Left Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16 hidden md:block">
                    <nav className="p-4 space-y-2">
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
                                    <span className="text-xl">{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
