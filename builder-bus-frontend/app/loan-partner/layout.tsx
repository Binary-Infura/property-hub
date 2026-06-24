'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/app/components/dashboard/UnifiedDashboardLayout';

export default function LoanAdvisorLayout({ children }: { children: React.ReactNode }) {
    return (
        <UnifiedDashboardLayout requiredRole="LOAN_PARTNER" title="Loan Partner Dashboard">
            {children}
        </UnifiedDashboardLayout>
    );
}
