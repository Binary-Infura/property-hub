'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { invitationService } from '@/app/services/invitationService';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  forcedRole?: string;
  allowedRoles?: string[];
}

const AVAILABLE_ROLES = [
  'CENTRAL_AUTHORITY',
  'ONBOARDING_MANAGER',
  'PROPERTY_PARTNER',
  'CONSULTANT',
  'MARKETING_MANAGER',
  'VISIT_EXECUTIVE',
  'INFLUENCER',
  'BROKER',
  'LOAN_ADVISOR',
  'BUYER',
];

export default function InviteUserModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  forcedRole,
  allowedRoles
}: InviteUserModalProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    selectedRole: forcedRole || '' as string,
  });

  // Reset selected role when modal opens with a new forcedRole
  React.useEffect(() => {
    if (isOpen && forcedRole) {
      setFormData(prev => ({ ...prev, selectedRole: forcedRole }));
    }
  }, [isOpen, forcedRole]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const selectRole = (role: string) => {
    setFormData(prev => ({ 
      ...prev, 
      selectedRole: prev.selectedRole === role ? '' : role 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    if (!formData.email && !formData.phone) {
      setError('Please provide either an email address or a phone number.');
      return;
    }

    if (!formData.selectedRole) {
      setError('Please select a role.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await invitationService.invite({
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        roles: [formData.selectedRole],
      }, token);

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setFormData({ email: '', phone: '', selectedRole: '' });
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Invite New User</h2>
            <p className="text-sm text-gray-500 font-medium">Send an invitation link via Email or WhatsApp</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all hover:rotate-90">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex items-center gap-3 animate-shake">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 text-lg">⚠️</div>
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-100 text-green-700 text-sm rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-lg">✅</div>
              <p className="font-semibold">Invitation sent successfully!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400 bg-gray-50/50"
                  placeholder="john@example.com"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">WhatsApp Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400 bg-gray-50/50"
                  placeholder="+91 98765 43210"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412 0 6.554-5.335 11.891-11.892 11.891-2.008-.001-3.974-.509-5.722-1.472l-6.276 1.681zm6.545-3.868c1.554.922 3.197 1.409 4.887 1.411 5.482 0 9.942-4.458 9.945-9.941.002-2.656-1.03-5.152-2.903-7.027-1.874-1.874-4.37-2.907-7.028-2.908-5.485 0-9.942 4.458-9.946 9.941-.001 1.83.498 3.614 1.442 5.174l-.946 3.454 3.549-.954zm10.708-7.31c-.3-.15-1.772-.875-2.046-.975-.274-.1-.475-.15-.674.15-.199.3-.773.975-.947 1.175-.175.199-.349.225-.649.075-.3-.15-1.266-.467-2.411-1.487-.893-.797-1.493-1.782-1.669-2.081-.176-.3-.018-.462.132-.612.135-.134.3-.349.449-.524.15-.175.199-.3.3-.499.1-.199.05-.374-.025-.524-.075-.15-.674-1.623-.923-2.223-.242-.584-.488-.504-.674-.514-.174-.009-.374-.01-.574-.01s-.524.075-.798.374c-.274.299-1.047 1.024-1.047 2.497 0 1.472 1.071 2.894 1.221 3.094.15.199 2.108 3.22 5.106 4.516.714.308 1.27.493 1.705.631.717.228 1.369.196 1.885.119.575-.086 1.772-.724 2.022-1.422.25-.698.25-1.298.175-1.422-.075-.124-.274-.199-.574-.349z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {!forcedRole && (
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 ml-1">Assign User Role <span className="text-gray-400 font-normal">(Select one)</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AVAILABLE_ROLES
                  .filter(role => !allowedRoles || allowedRoles.includes(role))
                  .map((role) => {
                    const isSelected = formData.selectedRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => selectRole(role)}
                        className={`px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]'
                            : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-500'
                        }`}
                      >
                        {role.replace('_', ' ')}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {forcedRole && (
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
              <p className="text-sm font-bold text-blue-900 ml-1">
                Role: <span className="text-blue-600 uppercase tracking-wider">{forcedRole.replace('_', ' ')}</span>
              </p>
            </div>
          )}

          <div className="bg-slate-50 rounded-2xl p-6 flex gap-4 border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm">
              <p className="font-bold text-slate-900 mb-1">Invitation Logic</p>
              <p className="text-gray-500 leading-relaxed font-medium">
                The user will receive a link to register. They will automatically be assigned the role {forcedRole ? <strong>{forcedRole.replace('_', ' ')}</strong> : 'you select above'} upon completing their registration. Link expires in 48h.
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 border-2 border-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all text-sm uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-[1.5] px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200 text-sm uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : success ? (
                'Sent!'
              ) : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
