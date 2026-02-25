'use client';

import Link from 'next/link';
import { UnifiedAppProvider } from '@/app/contexts/UnifiedAppContext';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import { usePathname } from 'next/navigation';
import RouteGuard from '@/app/components/auth/RouteGuard';
import SidebarIcon from '@/app/components/SidebarIcon';

import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import NoAllocationPlaceholder from '@/app/components/dashboard/NoAllocationPlaceholder';
import ProfileCompletionPrompt from '@/app/components/ProfileCompletionPrompt';

function CommissionManagerLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { activeContext } = useUnifiedApp();

  const navigation = [
    { name: 'Dashboard', href: '/commission-manager/dashboard', icon: 'dashboard' as const },
    { name: 'Payouts', href: '/commission-manager/dashboard/payouts', icon: 'money' as const },
    { name: 'Reports', href: '/commission-manager/dashboard/reports', icon: 'chart' as const },
    { name: 'Audit Trail', href: '/commission-manager/dashboard/audit-trail', icon: 'search' as const },
    { name: 'Disputes', href: '/commission-manager/dashboard/disputes', icon: 'scale' as const },
  ];

  const isActive = (href: string) => {
    if (href === '/commission-manager/dashboard') return pathname === href;
    return pathname?.startsWith(href);
  };

  const isNoAllocation = activeContext.activeRegion.id === 'no-region';

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
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <SidebarIcon name={item.icon} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader title="Commission Manager Dashboard" showLogo={isNoAllocation} />

        <main className={`flex-1 overflow-y-auto ${isNoAllocation ? 'flex items-center justify-center p-8' : 'p-8'}`}>
          <ProfileCompletionPrompt />
          {isNoAllocation ? <NoAllocationPlaceholder /> : children}
        </main>
      </div>
    </div>
  );
}

export default function CommissionManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredRole="commission-manager">
      <CommissionManagerLayoutContent>{children}</CommissionManagerLayoutContent>
    </RouteGuard>
  );
}
