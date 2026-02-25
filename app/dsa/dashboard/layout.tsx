'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SidebarIcon from '@/app/components/SidebarIcon';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import RouteGuard from '@/app/components/auth/RouteGuard';
import ProfileCompletionPrompt from '@/app/components/ProfileCompletionPrompt';

function DsaDashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { activeContext } = useUnifiedApp();

  const navigation = [
    { name: 'Dashboard', href: '/dsa/dashboard', icon: 'dashboard' as const },
    { name: 'Leads', href: '/dsa/dashboard/leads', icon: 'users' as const },
    { name: 'Commissions', href: '/dsa/dashboard/commissions', icon: 'money' as const },
    { name: 'Promotions', href: '/dsa/dashboard/promotions', icon: 'megaphone' as const },
    { name: 'Ads & Campaigns', href: '/dsa/dashboard/campaigns-leads', icon: 'chart' as const },
    { name: 'Ad Requests', href: '/dsa/dashboard/advertisement-requests', icon: 'note' as const },
  ];

  const isActive = (href: string) => {
    if (href === '/dsa/dashboard') return pathname === href;
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
                <SidebarIcon name={item.icon} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader title="DSA Dashboard" />

        <main className="flex-1 overflow-y-auto p-8">
          <ProfileCompletionPrompt />
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DsaDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredRole="dsa">
      <DsaDashboardLayoutContent>{children}</DsaDashboardLayoutContent>
    </RouteGuard>
  );
}
