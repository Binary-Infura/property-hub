'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/app/components/dashboard/UnifiedDashboardLayout';

export default function SharedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UnifiedDashboardLayout requiredRole={undefined} title="Property Hub Dashboard">
      {children}
    </UnifiedDashboardLayout>
  );
}
