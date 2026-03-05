'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/app/components/dashboard/UnifiedDashboardLayout';

export default function LoanAdviserDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UnifiedDashboardLayout requiredRole="loan-adviser" title="Loan Adviser Dashboard">
      {children}
    </UnifiedDashboardLayout>
  );
}
