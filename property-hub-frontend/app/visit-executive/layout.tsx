'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/app/components/dashboard/UnifiedDashboardLayout';

export default function VisitExecutiveLayout({ children }: { children: React.ReactNode }) {
    return (
        <UnifiedDashboardLayout requiredRole="VISIT_EXECUTIVE" title="Visit Executive Dashboard">
            {children}
        </UnifiedDashboardLayout>
    );
}
