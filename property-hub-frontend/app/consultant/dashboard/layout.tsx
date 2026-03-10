'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/app/components/dashboard/UnifiedDashboardLayout';

export default function ConsultantDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UnifiedDashboardLayout requiredRole="CONSULTANT" title="Consultant Dashboard">
      {children}
    </UnifiedDashboardLayout>
  );
}
