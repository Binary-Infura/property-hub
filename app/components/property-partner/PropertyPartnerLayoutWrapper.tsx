'use client';

import { UnifiedAppProvider } from '@/app/contexts/UnifiedAppContext';
import PropertyPartnerSidebar from './PropertyPartnerSidebar';
import PropertyPartnerTopNav from './PropertyPartnerTopNav';
import RouteGuard from '../auth/RouteGuard';

export default function PropertyPartnerLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requiredRole="property-partner">
      <UnifiedAppProvider>
        <div className="flex h-screen bg-gray-50 overflow-hidden">
          <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
            <PropertyPartnerSidebar />
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <PropertyPartnerTopNav />

            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </UnifiedAppProvider>
    </RouteGuard>
  );
}
