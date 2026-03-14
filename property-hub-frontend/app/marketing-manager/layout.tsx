'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/app/components/dashboard/UnifiedDashboardLayout';

export default function MarketingManagerLayout({ children }: { children: React.ReactNode }) {
    return (
        <UnifiedDashboardLayout requiredRole="MARKETING_MANAGER" title="Marketing Dashboard">
            {children}
        </UnifiedDashboardLayout>
    );
}
