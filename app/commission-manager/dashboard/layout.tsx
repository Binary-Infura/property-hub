import Link from 'next/link';

export default function CommissionManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Commission Manager</h1>
              <p className="text-gray-600 mt-1">Manage commissions, payouts, and financial incentives</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <Link
              href="/commission-manager/dashboard"
              className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Dashboard
            </Link>
            <Link
              href="/commission-manager/dashboard/payouts"
              className="border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Payouts
            </Link>
            <Link
              href="/commission-manager/dashboard/reports"
              className="border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Reports
            </Link>
            <Link
              href="/commission-manager/dashboard/audit-trail"
              className="border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Audit Trail
            </Link>
            <Link
              href="/commission-manager/dashboard/disputes"
              className="border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Disputes
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
