'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PropertyPartnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/property-partner/dashboard', icon: '📊' },
        { name: 'My Properties', href: '/property-partner/dashboard/properties', icon: '🏢' },
    ];

    const isActive = (href: string) => {
        if (href === '/property-partner/dashboard' && pathname === href) return true;
        if (href !== '/property-partner/dashboard' && pathname.startsWith(href)) return true;
        return false;
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-2xl">🤝</span>
                        <span>Property Partner</span>
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Property Hub Workspace</p>
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
                            <span className={`text-xl transition-transform group-hover:scale-110 ${isActive(item.href) ? 'scale-110' : ''}`}>
                                {item.icon}
                            </span>
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                            SH
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Suresh Homes</p>
                            <p className="text-xs text-gray-500">Partner Agency</p>
                        </div>
                    </div>
                    <button className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <span>🚪</span>
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-8 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
                        </h2>
                        <div className="flex items-center space-x-4">
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                🔔
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                ⚙️
                            </button>
                        </div>
                    </div>
                </header>
                <main className="p-8 pb-20">
                    {children}
                </main>
            </div>
        </div>
    );
}
