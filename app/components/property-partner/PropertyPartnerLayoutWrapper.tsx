'use client';

import { useState } from 'react';
import ProjectPartnerSidebar from './PropertyPartnerSidebar';
import ProjectPartnerTopNav from './PropertyPartnerTopNav';
import RouteGuard from '../auth/RouteGuard';
import ProfileCompletionPrompt from '../ProfileCompletionPrompt';

export default function PropertyPartnerLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <RouteGuard requiredRole="property-partner">
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Mobile Sidebar overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        )}

        <ProjectPartnerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
          <ProjectPartnerTopNav onMenuClick={() => setIsSidebarOpen(true)} />

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
