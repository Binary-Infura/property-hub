'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/app/components/dashboard/UnifiedDashboardLayout';

export default function CentralAuthorityDashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <UnifiedDashboardLayout requiredRole="CENTRAL_AUTHORITY" title="Central Authority Dashboard">
            {children}
        </UnifiedDashboardLayout>
    );
}
