import Link from 'next/link';
import SearchNavbar from '../components/SearchNavbar';

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
      <SearchNavbar />

      {/* Main Content */}
      {children}
    </div>
  );
}

