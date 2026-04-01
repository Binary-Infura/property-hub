'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/app/components/dashboard/UnifiedDashboardLayout';

export default function GrowthPartnerLayout({ children }: { children: React.ReactNode }) {
    return (
        <UnifiedDashboardLayout requiredRole="GROWTH_PARTNER" title="Growth Partner Dashboard">
            {children}
        </UnifiedDashboardLayout>
    );
}
