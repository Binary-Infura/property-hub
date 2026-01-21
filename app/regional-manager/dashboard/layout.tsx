'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function RegionalManagerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/regional-manager/dashboard', icon: '📊' },
    { name: 'Builders', href: '/regional-manager/dashboard/builders', icon: '🏗️' },
    { name: 'Consultants', href: '/regional-manager/dashboard/consultants', icon: '👤' },
    { name: 'Loan Advisers', href: '/regional-manager/dashboard/loan-advisers', icon: '🏦' },
    { name: 'Commission Managers', href: '/regional-manager/dashboard/commission-managers', icon: '💰' },
    { name: 'Channel Partners', href: '/regional-manager/dashboard/channel-partners', icon: '🤝' },
    { name: 'Visit Executives', href: '/regional-manager/dashboard/visit-executives', icon: '📍' },
    { name: 'Onboarding Managers', href: '/regional-manager/dashboard/onboarding-managers', icon: '👔' },
    { name: 'Property Partners', href: '/regional-manager/dashboard/property-partners', icon: '🤝' },
    { name: 'Service Providers', href: '/regional-manager/dashboard/service-providers', icon: '🛠️' },
  ];

  const isActive = (href: string) => {
    if (href === '/regional-manager/dashboard') {
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
              <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
              PropertyHub Regional Manager
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
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
