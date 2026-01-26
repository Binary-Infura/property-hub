'use client';

import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import NoRegionAllocated from '../dashboard/NoRegionAllocated';
import PropertyPartnerSidebar from './PropertyPartnerSidebar';
import PropertyPartnerTopNav from './PropertyPartnerTopNav';
import RouteGuard from '../auth/RouteGuard';
import ProfileCompletionPrompt from '../ProfileCompletionPrompt';

export default function PropertyPartnerLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeContext } = useUnifiedApp();
  const isNoRegion = activeContext.activeRegion.id === 'no-region';

  return (
    <RouteGuard requiredRole="property-partner">
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {!isNoRegion && (
          <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
            <PropertyPartnerSidebar />
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <PropertyPartnerTopNav showLogo={isNoRegion} />

          <main className={`flex-1 overflow-y-auto ${isNoRegion ? 'flex items-center justify-center p-8' : 'p-8'}`}>
            <ProfileCompletionPrompt />
            {isNoRegion ? <NoRegionAllocated /> : children}
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
