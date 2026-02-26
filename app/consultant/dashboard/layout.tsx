'use client';

/**
 * Consultant Dashboard Layout
 * 
 * This layout enforces that /consultant/dashboard is exclusively for consultants.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import RouteGuard from '@/app/components/auth/RouteGuard';
import ProfileCompletionPrompt from '@/app/components/ProfileCompletionPrompt';
import SidebarIcon from '@/app/components/SidebarIcon';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';

function ConsultantDashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { activeContext } = useUnifiedApp();

  const navigation = [
    { name: 'Dashboard', href: '/consultant/dashboard', icon: 'dashboard' as const },
    { name: 'My Clients', href: '/consultant/dashboard/clients', icon: 'users' as const },
    { name: 'Calendar', href: '/consultant/dashboard/calendar', icon: 'calendar' as const },
    { name: 'Properties', href: '/consultant/dashboard/properties', icon: 'home' as const },
  ];

  const isActive = (href: string) => {
    if (href === '/consultant/dashboard') return pathname === href;
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      {activeContext.activeCity && (
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

          <div className="p-4 border-t border-gray-100">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <SidebarIcon name="signout" className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader title="Consultant Dashboard" />

        <main className="flex-1 overflow-y-auto p-8">
          <ProfileCompletionPrompt />
          {children}
        </main>
      </div>
    </div>
  );
}

export default function ConsultantDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredRole="consultant">
      <ConsultantDashboardLayoutContent>{children}</ConsultantDashboardLayoutContent>
    </RouteGuard>
  );
}
