'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import UniversalRegistrationForm from '@/app/components/auth/UniversalRegistrationForm';

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const role = searchParams.get('role');

  if (token) {
    return (
      <UniversalRegistrationForm mode="INVITATION" token={token} />
    );
  }

  // If no token, we allow public signup via the register page
  // A role can be pre-selected via query param (?role=PROPERTY_PARTNER)
  return (
    <UniversalRegistrationForm mode="PUBLIC" initialRole={role || undefined} />
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <nav className="max-w-7xl mx-auto mb-12">
        <Link href="/" className="flex items-center gap-2 font-black text-2xl text-slate-800 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg ring-4 ring-white"></div>
          PropertyHub
        </Link>
      </nav>
      
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <RegisterPageContent />
      </Suspense>
    </div>
  );
}
