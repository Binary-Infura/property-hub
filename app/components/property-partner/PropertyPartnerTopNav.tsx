'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PropertyPartnerTopNavProps {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
}

export default function PropertyPartnerTopNav({ breadcrumbs = [], title }: PropertyPartnerTopNavProps) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);

  // Generate default breadcrumbs from pathname if not provided
  const defaultBreadcrumbs: BreadcrumbItem[] = [];
  if (pathname === '/property-partner/dashboard') {
    defaultBreadcrumbs.push({ label: 'Dashboard', href: '/property-partner/dashboard' });
  } else if (pathname.includes('/projects')) {
    defaultBreadcrumbs.push(
      { label: 'Dashboard', href: '/property-partner/dashboard' },
      { label: 'Projects', href: '/property-partner/dashboard/projects' },
    );
    if (pathname.includes('/buildings')) {
      defaultBreadcrumbs.push({ label: 'Buildings' });
      if (pathname.includes('/blocks')) {
        defaultBreadcrumbs.push({ label: 'Blocks' });
      }
    }
  }

  const finalBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:text-blue-600">
            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
            PropertyHub Partner
          </Link>
          {/* Breadcrumb */}
          {finalBreadcrumbs.length > 0 && (
            <nav className="hidden sm:flex items-center gap-2 text-sm text-gray-600 flex-1 min-w-0">
              {finalBreadcrumbs.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 min-w-0">
                  {idx > 0 && <span className="text-gray-400">/</span>}
                  {item.href ? (
                    <a href={item.href} className="text-gray-600 hover:text-gray-900 transition truncate">
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-gray-900 font-medium truncate">{item.label}</span>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-100 text-sm text-gray-900 placeholder-gray-500 outline-none w-48"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {[
                    { title: 'Property Approved', desc: 'Sun Tower has been approved', time: '2 hours ago' },
                    { title: 'New Lead', desc: 'You have a new inquiry for Block A', time: '4 hours ago' },
                    { title: 'Document Review', desc: 'Your brochure needs revision', time: '1 day ago' },
                  ].map((notif, idx) => (
                    <div key={idx} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer">
                      <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                      <p className="text-gray-600 text-xs mt-1">{notif.desc}</p>
                      <p className="text-gray-500 text-xs mt-2">{notif.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              PP
            </div>
            <div className="hidden sm:block text-left min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Property Partner</p>
              <p className="text-xs text-gray-600 truncate">Admin</p>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}
