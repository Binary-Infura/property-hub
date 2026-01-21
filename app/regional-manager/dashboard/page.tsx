'use client';

import Link from 'next/link';

export default function RegionalManagerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, Regional Manager</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Property Review Center Shortcut */}
          <Link
            href="/regional-manager/dashboard/property-review-center"
            className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md hover:border-blue-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                🏢
              </div>
              <h2 className="text-xl font-bold text-gray-900">Property Review Center</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Review, approve, and manage property submissions from builders.
              Track pending approvals and live properties.
            </p>
            <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
              Go to Review Center
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
          </Link>


          {/* Advertisement Requests Shortcut */}
          <Link
            href="/regional-manager/dashboard/advertisement-requests"
            className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md hover:border-purple-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                📢
              </div>
              <h2 className="text-xl font-bold text-gray-900">Advertisement Requests</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Submit and track promotion requests for properties. Manage marketing campaigns and budgets.
            </p>
            <div className="flex items-center text-purple-600 font-medium group-hover:gap-2 transition-all">
              Manage Requests
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
          </Link>


          {/* Campaigns & Leads Shortcut */}
          <Link
            href="/regional-manager/dashboard/campaigns-leads"
            className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md hover:border-green-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                📈
              </div>
              <h2 className="text-xl font-bold text-gray-900">Campaigns & Leads</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Monitor marketing campaigns, track ROI, and assign new leads to consultants in your region.
            </p>
            <div className="flex items-center text-green-600 font-medium group-hover:gap-2 transition-all">
              Manage Leads
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
          </Link>

          {/* Add more dashboard shortcuts here in the future if needed */}

        </div>
      </div>
    </div>
  );
}
