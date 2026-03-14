'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/app/components/dashboard/UnifiedDashboardLayout';

export default function OnboardingManagerLayout({ children }: { children: React.ReactNode }) {
    return (
        <UnifiedDashboardLayout requiredRole="ONBOARDING_MANAGER" title="Onboarding Manager Dashboard">
            {children}
        </UnifiedDashboardLayout>
    );
}
