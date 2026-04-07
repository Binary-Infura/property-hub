'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { invitationService, Invitation } from '@/app/services/invitationService';
import { bankService, Bank } from '@/app/services/bankService';
import { cityService, City } from '@/app/services/cityService';
import { bankBranchService, BankBranch } from '@/app/services/bankBranchService';

interface UniversalRegistrationFormProps {
  mode: 'INVITATION' | 'PUBLIC';
  token?: string; // Required for INVITATION mode
  initialRole?: string; // Optional for PUBLIC mode
}

export default function UniversalRegistrationForm({ mode, token, initialRole }: UniversalRegistrationFormProps) {
  const router = useRouter();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(mode === 'INVITATION');
  const [verifying, setVerifying] = useState(mode === 'INVITATION');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    selectedRole: initialRole || '',
    companyName: '',
    companyAddress: '',
    taxId: '',
    licenseNumber: '',
    agencyName: '',
    officeAddress: '',
    reraNumber: '',
    bankId: '',
    stateCode: '',
    cityId: '',
    cityName: '',
    branchId: '',
    branchName: '',
    termsAccepted: false,
  });

  const [activeBanks, setActiveBanks] = useState<Bank[]>([]);
  const [states, setStates] = useState<{ code: string, name: string }[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [branches, setBranches] = useState<BankBranch[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [showNewBranchInput, setShowNewBranchInput] = useState(false);

  const AVAILABLE_PARTNER_ROLES = [
    { id: 'PROPERTY_PARTNER', label: 'Property Partner' },
    { id: 'GROWTH_PARTNER', label: 'Growth Partner' },
    { id: 'LOAN_PARTNER', label: 'Loan Partner' },
  ];

  useEffect(() => {
    // If a role was passed in, but we're in PUBLIC mode, set it
    if (mode === 'PUBLIC' && initialRole && !formData.selectedRole) {
      setFormData(prev => ({ ...prev, selectedRole: initialRole }));
    }

    if (mode === 'INVITATION' && token) {
      const verifyToken = async () => {
        try {
          const data = await invitationService.verify(token);
          setInvitation(data);
          setFormData(prev => ({
            ...prev,
            email: data.email || '',
            phone: data.phone || '',
            selectedRole: data.roles[0] || '',
          }));
        } catch (err: any) {
          setError(err.message || 'Failed to verify invitation.');
        } finally {
          setVerifying(false);
          setLoading(false);
        }
      };
      verifyToken();
    }
  }, [token, mode, initialRole]);

  // Fetch Banks and States
  useEffect(() => {
    if (formData.selectedRole === 'LOAN_PARTNER') {
      const fetchData = async () => {
        setLoadingBanks(true);
        setLoadingStates(true);
        try {
          const [banksData, statesData] = await Promise.all([
            bankService.getActiveBanks(),
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/cities/india/states`).then(res => res.json())
          ]);
          setActiveBanks(banksData);
          setStates(statesData || []);
        } catch (err) {
          console.error('Failed to fetch banks/states:', err);
        } finally {
          setLoadingBanks(false);
          setLoadingStates(false);
        }
      };
      fetchData();
    }
  }, [formData.selectedRole]);

  // Fetch Cities when State changes
  useEffect(() => {
    if (formData.stateCode) {
      const selectedState = states.find(s => s.code === formData.stateCode);
      if (!selectedState) return;

      const fetchCities = async () => {
        setLoadingCities(true);
        try {
          // Fetch ALL cities for this state from the public API
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/cities/india/${formData.stateCode}/cities`);
          const citiesData = await response.json();
          setAllCities(citiesData || []);
          setFormData(prev => ({ ...prev, cityId: '', cityName: '' })); 
        } catch (err) {
          console.error('Failed to fetch cities:', err);
        } finally {
          setLoadingCities(false);
        }
      };
      fetchCities();
    } else {
      setAllCities([]);
    }
  }, [formData.stateCode, states]);

  // Fetch Branches
  useEffect(() => {
    if (formData.bankId && formData.cityId) {
      const fetchBranches = async () => {
        setLoadingBranches(true);
        try {
          const data = await bankBranchService.getBranches(formData.bankId, formData.cityId);
          setBranches(data);
          if (data.length === 0) {
            setShowNewBranchInput(true);
          } else {
            setShowNewBranchInput(false);
          }
        } catch (err) {
          console.error('Failed to fetch branches:', err);
        } finally {
          setLoadingBranches(false);
        }
      };
      fetchBranches();
    } else {
      setBranches([]);
      setShowNewBranchInput(false);
    }
  }, [formData.bankId, formData.cityId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name === 'cityId') {
      setFormData(prev => ({ 
        ...prev, 
        cityId: value,
        cityName: value 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }
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

    if (!formData.termsAccepted) {
      setError('You must accept the Terms and Conditions');
      return;
    }

    if (mode === 'PUBLIC' && !formData.selectedRole) {
      setError('Please select a partnership role');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedState = states.find(s => s.code === formData.stateCode);

      if (mode === 'INVITATION' && token) {
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
          agencyName: formData.agencyName || undefined,
          officeAddress: formData.officeAddress || undefined,
          reraNumber: formData.reraNumber || undefined,
          bankId: formData.bankId || undefined,
          branchId: formData.branchId || undefined,
          branchName: formData.branchName || undefined,
          cityId: formData.cityId || undefined,
          cityName: formData.cityName || undefined,
          stateName: selectedState?.name || undefined,
        });
        router.push('/signin?registered=true');
      } else {
        // PUBLIC MODE
        const result = await invitationService.publicSignup({
          email: formData.email,
          roles: [formData.selectedRole],
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          phone: formData.phone,
          companyName: formData.companyName || undefined,
          companyAddress: formData.companyAddress || undefined,
          taxId: formData.taxId || undefined,
          licenseNumber: formData.licenseNumber || undefined,
          agencyName: formData.agencyName || undefined,
          officeAddress: formData.officeAddress || undefined,
          reraNumber: formData.reraNumber || undefined,
          bankId: formData.bankId || undefined,
          branchId: formData.branchId || undefined,
          branchName: formData.branchName || undefined,
          cityId: formData.cityId || undefined,
          cityName: formData.cityName || undefined,
          stateName: selectedState?.name || undefined,
        });
        setSuccess(result.message || 'Signup successful! Please check your email for verification.');
        // Don't redirect immediately so they can see the success message
      }
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
        <p className="mt-4 text-gray-600 font-medium">Loading registration details...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center p-12 bg-white rounded-3xl shadow-xl border border-green-100 max-w-xl mx-auto">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          ✉️
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Check Your Email</h2>
        <p className="text-lg text-gray-600 mb-8">{success}</p>
        <Link href="/signin" className="inline-block bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all">
          Go to Sign In
        </Link>
      </div>
    );
  }

  const isThirdParty = mode === 'PUBLIC' || invitation?.type === 'THIRD_PARTY';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-3">
            {mode === 'PUBLIC' ? 'Join PropertyHub' : 'Complete Your Registration'}
          </h1>
          <p className="text-lg text-gray-600">
            {mode === 'PUBLIC' 
              ? 'Partner with India\'s most advanced real estate platform.' 
              : 'Fill in your details for the assigned roles:'}
          </p>
          
          {mode === 'INVITATION' && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {invitation?.roles.map(role => (
                <span key={role} className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold uppercase tracking-wider">
                  {role.replace('_', ' ')}
                </span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl animate-shake">
            <p className="text-red-800 font-medium text-center text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'PUBLIC' && (
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 ml-1">Select Partnership Role *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {AVAILABLE_PARTNER_ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, selectedRole: role.id })}
                    className={`px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
                      formData.selectedRole === role.id
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]'
                        : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-500'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">First Name *</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              disabled={mode === 'INVITATION'}
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className={`w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none ${mode === 'INVITATION' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50'}`}
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
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Password *</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Confirm Password *</label>
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

          {/* Business Information Section */}
          {isThirdParty && (
            <div className="space-y-4 rounded-3xl border border-blue-100 bg-blue-50/40 p-6 animate-in slide-in-from-top-4 duration-500">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Business Information
              </p>
              
              {formData.selectedRole !== 'LOAN_PARTNER' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Company / Organization Name *</label>
                    <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} placeholder="e.g. Prestige Builders" className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm" />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Office Address</label>
                    <input type="text" name="companyAddress" value={formData.companyAddress} onChange={handleChange} placeholder="Complete office address" className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">PAN / Tax ID</label>
                    <input type="text" name="taxId" value={formData.taxId} onChange={handleChange} placeholder="ABCDE1234F" className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">{formData.selectedRole === 'PROPERTY_PARTNER' ? 'RERA Registration No.' : 'License / Registration No.'}</label>
                    <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="e.g. RERA/12345/MUM" className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Select Bank *</label>
                    <select
                      name="bankId"
                      required
                      value={formData.bankId}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm"
                    >
                      <option value="">{loadingBanks ? 'Loading banks...' : 'Choose a Bank'}</option>
                      {activeBanks.map(bank => (
                        <option key={bank.id} value={bank.id}>{bank.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Select State *</label>
                    <select
                      name="stateCode"
                      required
                      value={formData.stateCode}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm"
                    >
                      <option value="">{loadingStates ? 'Loading states...' : 'Choose a State'}</option>
                      {states.map(state => (
                        <option key={state.code} value={state.code}>{state.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Select City *</label>
                    <select
                      name="cityId"
                      required
                      disabled={!formData.stateCode}
                      value={formData.cityId}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">{loadingCities ? 'Loading cities...' : !formData.stateCode ? 'Select a state first' : 'Choose a City'}</option>
                      {allCities.map((city: any, idx: number) => (
                        <option key={`${city.name}-${idx}`} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  </div>

                  {formData.bankId && formData.cityId && (
                    <div className="md:col-span-2 space-y-4 pt-2">
                      {branches.length > 0 && !showNewBranchInput ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Select Existing Branch *</label>
                            <select
                              name="branchId"
                              required={!showNewBranchInput}
                              value={formData.branchId}
                              onChange={handleChange}
                              className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm"
                            >
                              <option value="">Choose a Branch</option>
                              {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>{branch.name.toUpperCase()}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewBranchInput(true);
                              setFormData(prev => ({ ...prev, branchId: '' }));
                            }}
                            className="text-blue-600 text-sm font-bold hover:underline ml-1"
                          >
                            + Use a different branch
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 animate-in fade-in duration-500">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-bold text-slate-700 ml-1">Branch Details</label>
                            {branches.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setShowNewBranchInput(false)}
                                className="text-gray-500 text-xs font-bold hover:text-slate-900"
                              >
                                ← Back to existing branches
                              </button>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Branch Name *</label>
                            <input
                              type="text"
                              name="branchName"
                              required={showNewBranchInput}
                              value={formData.branchName}
                              onChange={handleChange}
                              placeholder="e.g. MG Road Branch"
                              className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Office Address</label>
                            <input
                              type="text"
                              name="officeAddress"
                              value={formData.officeAddress}
                              onChange={handleChange}
                              placeholder="Full office address"
                              className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-start gap-3 p-2">
            <input
              type="checkbox"
              id="termsAccepted"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="termsAccepted" className="text-sm text-gray-600 font-medium leading-relaxed">
              I agree to the <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>. *
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-[1.01] transition-all transform active:scale-[0.98] disabled:opacity-50 mt-4 shadow-xl flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing Registration...
              </>
            ) : mode === 'PUBLIC' ? 'Create Partner Account' : 'Complete Registration'}
          </button>

          <p className="text-center text-gray-400 text-xs mt-8">
            PropertyHub &copy; {new Date().getFullYear()} - Advanced Real Estate Ecosystem
          </p>
        </form>
      </div>
    </div>
  );
}
