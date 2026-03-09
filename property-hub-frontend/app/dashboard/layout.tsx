'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/app/components/dashboard/UnifiedDashboardLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UnifiedDashboardLayout requiredRole="buyer" title="Buyer Dashboard">
      {children}
    </UnifiedDashboardLayout>
  );
}
