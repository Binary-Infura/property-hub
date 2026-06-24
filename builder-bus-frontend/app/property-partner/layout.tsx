'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/app/components/dashboard/UnifiedDashboardLayout';

export default function PropertyPartnerLayout({ children }: { children: React.ReactNode }) {
    return (
        <UnifiedDashboardLayout requiredRole="PROPERTY_PARTNER" title="Property Partner Dashboard">
            {children}
        </UnifiedDashboardLayout>
    );
}
