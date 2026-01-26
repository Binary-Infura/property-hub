'use client';

import Link from 'next/link';
import { getRoleFromPath } from '@/app/lib/routing';
import RouteGuard from '@/app/components/auth/RouteGuard';
import ProfileCompletionPrompt from '@/app/components/ProfileCompletionPrompt';


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
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:text-blue-600">
                <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                PropertyHub
              </Link>
              <div className="flex items-center gap-6">
                <a href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProfileCompletionPrompt />
          {children}
        </div>
      </div>
    </RouteGuard>
  );
}
