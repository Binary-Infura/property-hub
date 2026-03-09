import Link from 'next/link';
import Navbar from '../components/Navbar';

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
      <Navbar />

      {/* Main Content */}
      {children}
    </div>
  );
}

