'use client';

import Link from 'next/link';
import { getRoleFromPath } from '@/app/lib/routing';
import RouteGuard from '@/app/components/auth/RouteGuard';
import ProfileCompletionPrompt from '@/app/components/ProfileCompletionPrompt';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';


/**
 * Buyer Dashboard Layout
 * 
 * This layout enforces that /dashboard is exclusively for buyers.
 * When authentication is implemented, this layout should redirect
 * non-buyer users to their appropriate role dashboard.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requiredRole="buyer">
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top Navigation */}
        <DashboardHeader showLogo={true} title="Buyer Dashboard" />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <ProfileCompletionPrompt />
          {children}
        </div>
      </div>
    </RouteGuard>
  );
}
