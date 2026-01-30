'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UnifiedAppProvider } from '@/app/contexts/UnifiedAppContext';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import RouteGuard from '@/app/components/auth/RouteGuard';

import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import NoRegionAllocated from '@/app/components/dashboard/NoRegionAllocated';
import ProfileCompletionPrompt from '@/app/components/ProfileCompletionPrompt';

function RegionalManagerDashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { activeContext } = useUnifiedApp();

  const navigation = [
    { name: 'Dashboard', href: '/regional-manager/dashboard', icon: '📊' },
    { name: 'Consultants', href: '/regional-manager/dashboard/consultants', icon: '👤' },
    { name: 'Loan Advisers', href: '/regional-manager/dashboard/loan-advisers', icon: '🏦' },
    { name: 'Channel Partners', href: '/regional-manager/dashboard/channel-partners', icon: '🤝' },
    { name: 'Visit Executives', href: '/regional-manager/dashboard/visit-executives', icon: '📍' },
  ];

  const isActive = (href: string) => {
    if (href === '/regional-manager/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const isNoRegion = activeContext.activeRegion.id === 'no-region';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      {!isNoRegion && (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300">
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
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader title="Regional Manager Dashboard" showLogo={isNoRegion} />

        <main className={`flex-1 overflow-y-auto ${isNoRegion ? 'flex items-center justify-center p-8' : 'p-8'}`}>
          <ProfileCompletionPrompt />
          {isNoRegion ? <NoRegionAllocated /> : children}
        </main>
      </div>
    </div>
  );
}

export default function RegionalManagerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredRole="regional-manager">
      <RegionalManagerDashboardLayoutContent>{children}</RegionalManagerDashboardLayoutContent>
    </RouteGuard>
  );
}
