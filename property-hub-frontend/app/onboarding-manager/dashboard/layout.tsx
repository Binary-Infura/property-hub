'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/app/components/dashboard/UnifiedDashboardLayout';

export default function OnboardingManagerLayout({ children }: { children: React.ReactNode }) {
    return (
        <UnifiedDashboardLayout requiredRole="onboarding-manager" title="Onboarding Manager Dashboard">
            {children}
        </UnifiedDashboardLayout>
    );
}
