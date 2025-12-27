'use client';

import Link from 'next/link';

export default function DashboardIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            PropertyHub Dashboards
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your portal to manage properties and submissions
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Builder Portal */}
          <Link
            href="/dashboard/builder"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition p-8 border-2 border-transparent hover:border-blue-600"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full group-hover:bg-blue-200 transition mb-6">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.581m0 0H9m5.581 0a2.121 2.121 0 01-4.242 0m4.242 0H15m0 0H9m0 0a2.121 2.121 0 00-4.242 0m4.242 0h5.581"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition">
              Builder Portal
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Submit and manage your properties. Create drafts, upload images and brochures, and track approval status.
            </p>
            <ul className="space-y-2 text-gray-600 text-sm mb-8">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Create property drafts
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Upload images & brochures
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Track submission status
              </li>
            </ul>
            <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg group-hover:bg-blue-700 transition font-semibold">
              Go to Builder Portal →
            </div>
          </Link>

          {/* Admin Portal */}
          <Link
            href="/dashboard/admin"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition p-8 border-2 border-transparent hover:border-purple-600"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full group-hover:bg-purple-200 transition mb-6">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition">
              Admin Panel
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Review builder submissions, approve or reject properties, add internal notes, and control what goes live.
            </p>
            <ul className="space-y-2 text-gray-600 text-sm mb-8">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Review submissions
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Approve or reject properties
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Manage live listings
              </li>
            </ul>
            <div className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg group-hover:bg-purple-700 transition font-semibold">
              Go to Admin Panel →
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Workflow Overview</h3>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mb-3">
                  1
                </div>
                <p className="font-semibold text-gray-900">Builder Submits</p>
                <p className="text-sm text-gray-600 mt-1">Property added to system</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold mb-3">
                  2
                </div>
                <p className="font-semibold text-gray-900">Admin Reviews</p>
                <p className="text-sm text-gray-600 mt-1">Quality & completeness check</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold mb-3">
                  3
                </div>
                <p className="font-semibold text-gray-900">Approve/Reject</p>
                <p className="text-sm text-gray-600 mt-1">Decision made with feedback</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mb-3">
                  4
                </div>
                <p className="font-semibold text-gray-900">Go Live</p>
                <p className="text-sm text-gray-600 mt-1">Published to platform</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            ← Back to PropertyHub Home
          </Link>
        </div>
      </div>
    </div>
  );
}
