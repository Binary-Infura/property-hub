'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PropertyPartnerTopNavProps {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  showLogo?: boolean;
}

export default function PropertyPartnerTopNav({ breadcrumbs = [], title, showLogo = false }: PropertyPartnerTopNavProps) {
  const pathname = usePathname();

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
    <DashboardHeader
      breadcrumbs={finalBreadcrumbs}
      title={title}
      showSearch={true}
      showNotifications={true}
      showLogo={showLogo}
    />
  );
}
