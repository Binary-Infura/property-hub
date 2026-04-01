'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { invitationService, Invitation } from '@/app/services/invitationService';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
    companyAddress: '',
    taxId: '',
    licenseNumber: '',
    agencyName: '',
    officeAddress: '',
    reraNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing invitation token.');
      setVerifying(false);
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const data = await invitationService.verify(token);
        setInvitation(data);
        setFormData(prev => ({
          ...prev,
          phone: data.phone || '',
        }));
      } catch (err: any) {
        setError(err.message || 'Failed to verify invitation.');
      } finally {
        setVerifying(false);
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      await invitationService.register({
        token,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        phone: formData.phone,
        companyName: formData.companyName || undefined,
        companyAddress: formData.companyAddress || undefined,
        taxId: formData.taxId || undefined,
        licenseNumber: formData.licenseNumber || undefined,
        reraNumber: formData.reraNumber || undefined,
      });

      router.push('/signin?registered=true');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Verifying your invitation...</p>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100 max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          ⚠️
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/" className="inline-block bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-3">
            Welcome to PropertyHub
          </h1>
          <p className="text-lg text-gray-600">
            Complete your registration for the assigned roles:
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {invitation?.roles.map(role => (
              <span key={role} className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold uppercase tracking-wider">
                {role.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl animate-shake">
            <p className="text-red-800 font-medium text-center text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address</label>
            <input
              type="email"
              disabled
              value={invitation?.email || ''}
              className="w-full px-5 py-3.5 bg-gray-100 border border-gray-200 rounded-2xl text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your mobile number"
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          {/* Business Information Section - Only for Third Party Invitations */}
          {invitation?.type === 'THIRD_PARTY' && (
            <div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-5 animate-in slide-in-from-top-4 duration-500">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">🏢 Business Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Company Name *</label>
                  <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} placeholder="ABC Builders Pvt. Ltd." className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Company Address</label>
                  <input type="text" name="companyAddress" value={formData.companyAddress} onChange={handleChange} placeholder="123 Builder Street, Mumbai" className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">PAN / Tax ID</label>
                  <input type="text" name="taxId" value={formData.taxId} onChange={handleChange} placeholder="ABCDE1234F" className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">RERA / License Number</label>
                  <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="RERA/123456" className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none" />
                </div>
              </div>
            </div>
          )}



          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all transform active:scale-[0.98] disabled:opacity-50 mt-4 shadow-lg"
          >
            {isSubmitting ? 'Finalizing your account...' : 'Complete Registration'}
          </button>

          <p className="text-center text-gray-400 text-xs mt-6">
            By registering, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
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
        <RegisterForm />
      </Suspense>
    </div>
  );
}
