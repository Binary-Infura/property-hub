import Link from 'next/link';

export const metadata = {
  title: 'Search Properties - PropertyHub',
  description: 'Search and compare properties based on your preferences',
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:text-blue-600">
              <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
              PropertyHub
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                My Dashboard
              </Link>
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {children}
    </div>
  );
}

