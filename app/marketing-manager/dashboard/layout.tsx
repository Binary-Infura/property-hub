'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/app/components/dashboard/UnifiedDashboardLayout';

export default function MarketingManagerDashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <UnifiedDashboardLayout requiredRole="marketing-manager" title="Marketing Manager Dashboard">
            {children}
        </UnifiedDashboardLayout>
    );
}
