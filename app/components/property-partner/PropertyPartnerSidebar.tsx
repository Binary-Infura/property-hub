'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PropertyPartnerSidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/property-partner/dashboard', icon: '📊' },
    { name: 'Properties', href: '/property-partner/dashboard/properties', icon: '🏢' },
    { name: 'Leads', href: '/property-partner/dashboard/leads', icon: '📋' },
  ];

  const isActive = (href: string) => {
    if (href === '/property-partner/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/property-partner/dashboard" className="flex items-center gap-2 font-bold text-xl text-gray-900">
          <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
          <span>PropertyHub</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive(item.href)
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile Card */}
      <div className="border-t border-gray-200 px-4 py-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            PP
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">Property Partner</p>
            <p className="text-xs text-gray-600 truncate">partner@example.com</p>
          </div>
        </div>
        <button className="w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white rounded-lg border border-gray-200 transition">
          Logout
        </button>
      </div>
    </aside>
  );
}
