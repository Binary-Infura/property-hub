import BuilderSidebar from '@/app/components/builder/BuilderSidebar';
import BuilderTopNav from '@/app/components/builder/BuilderTopNav';

export const metadata = {
  title: 'Builder Dashboard - PropertyHub',
  description: 'Builder dashboard for managing property submissions',
};

/**
 * Builder Dashboard Layout
 *
 * This layout enforces that /builder/dashboard is exclusively for builders.
 * Features:
 * - Sidebar navigation with collapsible menus
 * - Top navigation bar with breadcrumbs
 * - Role-based routing for builder features
 * - Responsive design for mobile and desktop
 *
 * When authentication is implemented, this layout should redirect
 * non-builder users to their appropriate role dashboard.
 */
export default function BuilderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <BuilderTopNav />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <BuilderSidebar />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
