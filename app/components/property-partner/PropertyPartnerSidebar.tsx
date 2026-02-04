'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

export default function PropertyPartnerSidebar() {
  const pathname = usePathname();
  const { profileStatus } = useAuth();

  const mainNavigation = [
    { name: 'Dashboard', href: '/property-partner/dashboard', icon: '📊' },
    { name: 'Properties', href: '/property-partner/dashboard/properties', icon: '🏢' },
    { name: 'Public Listing', href: '/property-partner/dashboard/public-listing', icon: '🌐' },
    { name: 'Business Info', href: '/property-partner/dashboard/profile', icon: '💼' },
  ];

  const advancedNavigation = [
    { name: 'Consultants', href: '/property-partner/dashboard/consultants', icon: '👤' },
    { name: 'Loan Advisers', href: '/property-partner/dashboard/loan-advisers', icon: '🏦' },
    { name: 'Channel Partners', href: '/property-partner/dashboard/channel-partners', icon: '🤝' },
    { name: 'Visit Executives', href: '/property-partner/dashboard/visit-executives', icon: '📍' },
    { name: 'Service Providers', href: '/property-partner/dashboard/service-providers', icon: '🛠️' },
    { name: 'Leads', href: '/property-partner/dashboard/leads', icon: '📋' },
  ];

  const isActive = (href: string) => {
    if (href === '/property-partner/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const isPremium = profileStatus?.['property-partner']?.profileData?.isPremium;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shrink-0">
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/property-partner/dashboard" className="flex items-center gap-2 font-bold text-xl text-gray-900">
          <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
          <span>PropertyHub</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-3 py-6 space-y-2">
          {mainNavigation.map((item) => (
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

        <div className="mt-4">
          <div className="px-7 mb-2 flex justify-between items-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Premium Toolkit</p>
            {!isPremium && (
              <span className="text-xs" title="Premium subscription required">🔒</span>
            )}
          </div>
          <nav className="px-3 space-y-1">
            {advancedNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${isActive(item.href)
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-gray-600 hover:bg-gray-50'
                  } ${!isPremium ? 'opacity-70 grayscale-[0.5]' : ''}`}
              >
                <div className="relative">
                  <span className="text-lg">{item.icon}</span>
                  {!isPremium && (
                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-[1px] shadow-sm">
                      <svg className="w-2.5 h-2.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}
