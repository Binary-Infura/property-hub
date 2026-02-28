'use client';

import ProjectPartnerSidebar from './PropertyPartnerSidebar';
import ProjectPartnerTopNav from './PropertyPartnerTopNav';
import RouteGuard from '../auth/RouteGuard';
import ProfileCompletionPrompt from '../ProfileCompletionPrompt';

export default function PropertyPartnerLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requiredRole="property-partner">
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <ProjectPartnerSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <ProjectPartnerTopNav />

          <main className="flex-1 overflow-y-auto">
            <ProfileCompletionPrompt />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
