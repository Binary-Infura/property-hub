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
  const requiredRole = 'BUYER';

  return (
    <UnifiedDashboardLayout requiredRole="BUYER" title="My Dashboard">
      {children}
    </UnifiedDashboardLayout>
  );
}
