'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UnifiedAppProvider } from '@/app/contexts/UnifiedAppContext';
import InternalDashboardHeader from '@/app/components/dashboard/InternalDashboardHeader';
import RouteGuard from '@/app/components/auth/RouteGuard';

function RegionalManagerDashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/regional-manager/dashboard', icon: '📊' },
    { name: 'Property Partners', href: '/regional-manager/dashboard/property-partners', icon: '🤝' },
    { name: 'Consultants', href: '/regional-manager/dashboard/consultants', icon: '👤' },
    { name: 'Loan Advisers', href: '/regional-manager/dashboard/loan-advisers', icon: '🏦' },
    { name: 'Channel Partners', href: '/regional-manager/dashboard/channel-partners', icon: '🤝' },
    { name: 'Visit Executives', href: '/regional-manager/dashboard/visit-executives', icon: '📍' },
    { name: 'Onboarding Managers', href: '/regional-manager/dashboard/onboarding-managers', icon: '👔' },

    { name: 'Service Providers', href: '/regional-manager/dashboard/service-providers', icon: '🛠️' },
  ];

  const isActive = (href: string) => {
    if (href === '/regional-manager/dashboard') {
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <InternalDashboardHeader title="Regional Manager Dashboard" />

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RegionalManagerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredRole="regional-manager">
      <UnifiedAppProvider>
        <RegionalManagerDashboardLayoutContent>{children}</RegionalManagerDashboardLayoutContent>
      </UnifiedAppProvider>
    </RouteGuard>
  );
}
