'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/app/components/dashboard/UnifiedDashboardLayout';

export default function BrokerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UnifiedDashboardLayout requiredRole="BROKER" title="Broker Dashboard">
      {children}
    </UnifiedDashboardLayout>
  );
}
