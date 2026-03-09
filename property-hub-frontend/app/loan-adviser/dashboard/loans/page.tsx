'use client';

export default function LoansPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Active Loans</h1>
      <p className="text-gray-600 mb-8">Detailed view of all active loan applications</p>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
        <div className="text-6xl mb-4 text-blue-600">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-600">This page will show a detailed list of all active loans</p>
        <p className="text-sm text-gray-500 mt-2">Feature coming soon</p>
      </div>
    </div>
  );
}

