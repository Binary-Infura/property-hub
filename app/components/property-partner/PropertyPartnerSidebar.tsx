'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import SidebarIcon from '@/app/components/SidebarIcon';

interface ProjectPartnerSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ProjectPartnerSidebar({ isOpen = false, onClose }: ProjectPartnerSidebarProps) {
  const pathname = usePathname();
  const { profileStatus } = useAuth();

  const mainNavigation = [
    { name: 'Dashboard', href: '/property-partner/dashboard', icon: 'dashboard' as const },
    { name: 'Projects', href: '/property-partner/dashboard/projects', icon: 'building' as const },
    { name: 'Units', href: '/property-partner/dashboard/units', icon: 'home' as const },
    { name: 'Business Info', href: '/property-partner/dashboard/profile', icon: 'briefcase' as const },
  ];

  const advancedNavigation = [
    { name: 'Consultants', href: '/property-partner/dashboard/consultants', icon: 'person' as const },
    { name: 'Loan Advisers', href: '/property-partner/dashboard/loan-advisers', icon: 'bank' as const },
    { name: 'Visit Executives', href: '/property-partner/dashboard/visit-executives', icon: 'pin' as const },
    { name: 'Project Allocation', href: '/property-partner/dashboard/projects/allocation', icon: 'building' as const },
    { name: 'Leads', href: '/property-partner/dashboard/leads', icon: 'clipboard' as const },
    { name: 'Reels', href: '/property-partner/dashboard/reels', icon: 'video' as const },
  ];

  const isActive = (href: string) => {
    if (href === '/property-partner/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const isPremium = profileStatus?.['property-partner']?.profileData?.isPremium;

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 md:relative md:flex flex-col shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
          <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
          <span>ProjectHub</span>
        </Link>
        {onClose && (
          <button className="md:hidden text-gray-400 hover:text-gray-900" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
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
              <SidebarIcon name={item.icon} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-4">
          <div className="px-7 mb-2 flex justify-between items-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Premium Toolkit</p>
            {!isPremium && (
              <span className="text-gray-400" title="Premium subscription required">
                <SidebarIcon name="lock" className="w-3.5 h-3.5" />
              </span>
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
                  <SidebarIcon name={item.icon} className="w-[18px] h-[18px]" />
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
