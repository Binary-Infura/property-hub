

export const metadata = {
  title: 'Builder Dashboard - PropertyHub',
  description: 'Builder dashboard for managing property submissions',
};

/**
 * Builder Dashboard Layout
 *
 * This is a Server Component that exports metadata for SEO.
 * The actual UI with client-side interactions (sidebar toggle, etc.)
 * is handled by the BuilderLayoutWrapper client component.
 *
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
  return <>{children}</>;
}
