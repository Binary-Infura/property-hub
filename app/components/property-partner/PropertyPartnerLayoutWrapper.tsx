'use client';

import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import NoAllocationPlaceholder from '../dashboard/NoAllocationPlaceholder';
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
  const isNoAllocation = activeContext.activeRegion.id === 'no-region';

  return (
    <RouteGuard requiredRole="property-partner">
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {!isNoAllocation && <PropertyPartnerSidebar />}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <PropertyPartnerTopNav showLogo={isNoAllocation} />

          <main className={`flex-1 overflow-y-auto ${isNoAllocation ? 'flex items-center justify-center p-8' : ''}`}>
            <ProfileCompletionPrompt />
            {isNoAllocation ? (
              <NoAllocationPlaceholder />
            ) : (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
                {children}
              </div>
            )}
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
