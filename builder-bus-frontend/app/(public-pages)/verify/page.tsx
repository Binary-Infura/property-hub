'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { invitationService } from '@/app/services/invitationService';

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your account...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email.');
      return;
    }

    const verify = async () => {
      try {
        const result = await invitationService.verifySignup(token);
        setStatus('success');
        setMessage(result.message || 'Email verified successfully! Your account is now active.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-10 text-center border border-gray-100">
        {status === 'loading' && (
          <div className="py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Account</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              ✅
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Success!</h2>
            <p className="text-lg text-gray-600 mb-10">{message}</p>
            <Link 
              href="/signin" 
              className="inline-block w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              Sign In Now
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              ❌
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Verification Failed</h2>
            <p className="text-lg text-gray-600 mb-10">{message}</p>
            <Link 
              href="/partners" 
              className="inline-block w-full bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 mb-4"
            >
              Back to Partners Page
            </Link>
            <Link 
              href="/" 
              className="text-gray-400 hover:text-gray-600 font-medium transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-white to-indigo-100 flex flex-col items-center justify-center p-4">
      <nav className="mb-12">
        <Link href="/" className="flex items-center gap-2 font-black text-3xl text-slate-800 hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg ring-4 ring-white"></div>
          BuilderBus
        </Link>
      </nav>

      <Suspense fallback={
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      }>
        <VerifyPageContent />
      </Suspense>
    </div>
  );
}
