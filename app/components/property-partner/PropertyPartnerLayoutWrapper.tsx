'use client';

import PropertyPartnerSidebar from './PropertyPartnerSidebar';
import PropertyPartnerTopNav from './PropertyPartnerTopNav';

export default function PropertyPartnerLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PropertyPartnerTopNav />
      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16">
          <PropertyPartnerSidebar />
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
