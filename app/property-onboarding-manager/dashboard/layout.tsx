'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UnifiedAppProvider } from '@/app/contexts/UnifiedAppContext';
import InternalDashboardHeader from '@/app/components/dashboard/InternalDashboardHeader';
import RouteGuard from '@/app/components/auth/RouteGuard';

function PropertyOnboardingManagerLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/property-onboarding-manager/dashboard', icon: '📊' },
        { name: 'Properties', href: '/property-onboarding-manager/dashboard/properties', icon: '🏢' },

        { name: 'Property Partners', href: '/property-onboarding-manager/dashboard/property-partners', icon: '🤝' },
        { name: 'Service Providers', href: '/property-onboarding-manager/dashboard/service-providers', icon: '🛠️' },
    ];

    const isActive = (href: string) => {
        if (href === '/property-onboarding-manager/dashboard' && pathname === href) return true;
        if (href !== '/property-onboarding-manager/dashboard' && pathname.startsWith(href)) return true;
        return false;
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                        <span>PropertyHub</span>
                    </Link>
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

            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <InternalDashboardHeader title="Property Onboarding Manager Dashboard" />
                <main className="flex-1 overflow-y-auto p-8 pb-20">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function PropertyOnboardingManagerLayout({ children }: { children: React.ReactNode }) {
    return (
        <RouteGuard requiredRole="property-onboarding-manager">
            <UnifiedAppProvider>
                <PropertyOnboardingManagerLayoutContent>{children}</PropertyOnboardingManagerLayoutContent>
            </UnifiedAppProvider>
        </RouteGuard>
    );
}
