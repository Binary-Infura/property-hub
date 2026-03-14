'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/app/components/dashboard/UnifiedDashboardLayout';

export default function InfluencerLayout({ children }: { children: React.ReactNode }) {
    return (
        <UnifiedDashboardLayout requiredRole="INFLUENCER" title="Influencer Dashboard">
            {children}
        </UnifiedDashboardLayout>
    );
}
