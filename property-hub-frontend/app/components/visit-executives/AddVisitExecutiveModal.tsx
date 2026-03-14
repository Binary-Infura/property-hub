'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { userService, User } from '@/app/services/userService';

interface AddVisitExecutiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

export default function AddVisitExecutiveModal({
  isOpen,
  onClose,
  onSuccess,
}: AddVisitExecutiveModalProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(EMPTY_FORM);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.firstName.trim()) {
      setError('First name is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone (WhatsApp) number is required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const created = await userService.create(
        { ...formData, role: 'VISIT_EXECUTIVE' },
        token,
      );
      setSuccess(true);
      setTimeout(() => {
        onSuccess(created);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to add visit executive');
    } finally {
      setLoading(false);
    }
  };

  const field = (
    label: string,
    key: keyof typeof EMPTY_FORM,
    type = 'text',
    placeholder = '',
    required = false,
  ) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={formData[key]}
        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400 bg-gray-50/50"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 border border-white/20">
        {/* Header */}
        <div className="p-7 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Add Visit Executive</h2>
            <p className="text-sm text-gray-500 font-medium mt-0.5">Create a new contact user for site visits</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-all hover:rotate-90"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex items-center gap-3">
              <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 text-base">⚠️</div>
              <p className="font-semibold">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-100 text-green-700 text-sm rounded-2xl flex items-center gap-3">
              <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-base">✅</div>
              <p className="font-semibold">Visit executive added successfully!</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {field('First Name', 'firstName', 'text', 'e.g. Rajan', true)}
            {field('Last Name', 'lastName', 'text', 'e.g. Sharma')}
          </div>
          {field('Email Address', 'email', 'email', 'rajan@example.com')}
          {field('WhatsApp / Phone', 'phone', 'tel', '+91 98765 43210', true)}

          <p className="text-xs text-gray-500 leading-relaxed">
            This creates a direct user account. The visit executive will be notified when assigned to a site visit — they do <strong>not</strong> have a login portal.
          </p>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all text-sm uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-[1.5] px-6 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200 text-sm uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : success ? 'Added!' : 'Add Executive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
