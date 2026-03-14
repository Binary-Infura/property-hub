'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/app/components/dashboard/UnifiedDashboardLayout';
import { useAuth } from '@/app/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const sharedPaths = ['/dashboard/search', '/dashboard/loan', '/dashboard/saved', '/dashboard/inquiries', '/dashboard/documents'];
  const isShared = sharedPaths.some(p => pathname.startsWith(p));
  
  // If it's a shared path, we don't require a specific role (just authentication).
  // Otherwise, default to BUYER (the canonical user of /dashboard).
  const requiredRole = isShared ? undefined : 'BUYER';

  return (
    <UnifiedDashboardLayout requiredRole={requiredRole as any} title="Dashboard">
      {children}
    </UnifiedDashboardLayout>
  );
}
