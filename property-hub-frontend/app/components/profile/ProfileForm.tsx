'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { userService } from '@/app/services/userService';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';

export default function ProfileForm() {
    const { profileStatus, refreshProfileStatus, user, token, roles } = useAuth();
    const { activeContext } = useUnifiedApp();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState<any>({
        firstName: '',
        lastName: '',
        phone: '',
        activeRole: '',

        // Consultant
        specialization: [],
        experienceYears: 0,
        // Buyer
        budgetMin: 0,
        budgetMax: 0,
        preferredLocations: [],
        // Growth Partner
        campaignBudgetLimit: 0,
        socialMediaLinks: {},
        reach: 0,
        niche: '',
    });

    useEffect(() => {
        if (!user || !profileStatus) return;

        const pp = profileStatus['PROPERTY_PARTNER']?.profileData || {};

        const co = profileStatus['CONSULTANT']?.profileData || {};
        const bu = profileStatus['BUYER']?.profileData || {};
        const gp = profileStatus['GROWTH_PARTNER']?.profileData || {};
        const ca = profileStatus['CENTRAL_AUTHORITY']?.profileData || {};

        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            activeRole: user.activeRole || '',

            // Consultant
            specialization: co.specialization || [],
            experienceYears: co.experienceYears || 0,
            // Buyer
            budgetMin: bu.budgetMin || 0,
            budgetMax: bu.budgetMax || 0,
            preferredLocations: bu.preferredLocations || [],
            // Growth Partner
            socialMediaLinks: gp.socialMediaLinks || {},
            reach: gp.reach || 0,
            niche: gp.niche || '',
            campaignBudgetLimit: gp.campaignBudgetLimit || 0,
        });
    }, [user, profileStatus]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            setLoading(true);
            setMessage(null);

            // Construct correctly structured submission data for the backend
            // 1. Top-level fields
            // 2. Everything else in profileData
            const { firstName, lastName, phone, ...restFormData } = formData;
            
            const submissionData: any = {
                firstName,
                lastName,
                phone,
                profileData: restFormData
            };

            await userService.updateProfile(submissionData, token);
            await refreshProfileStatus();
            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Close after a short delay if success
            setTimeout(() => {
                setMessage(null);
            }, 3000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const userRoles = roles; // Show fields for all roles the user has

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 max-w-4xl animate-in fade-in duration-500">
            {message && (
                <div className={`p-4 mb-8 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-bold">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-12">
                {/* Section: Basic Information */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 tracking-tight">Basic Information</h3>
                            <p className="text-sm text-gray-500 font-medium">Your personal details and contact info.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium shadow-sm"
                                placeholder="John"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium shadow-sm"
                                placeholder="Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium shadow-sm"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                        <div className="space-y-2 opacity-70">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                className="w-full px-5 py-3.5 bg-gray-100 border border-transparent rounded-2xl text-sm font-medium cursor-not-allowed"
                                disabled
                            />
                            <p className="text-[10px] text-gray-400 font-bold ml-1">Email cannot be changed from profile settings.</p>
                        </div>
                    </div>
                </div>

                {/* Section: Consultant */}
                {userRoles.includes('CONSULTANT') && (
                    <div>
                        <div className="flex items-center gap-3 mb-6 pt-6 border-t border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Consultant Profile</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 bg-orange-50/30 p-6 rounded-2xl border border-orange-100/50">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Experience (Years)</label>
                                <input
                                    type="number"
                                    value={formData.experienceYears}
                                    onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium shadow-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Specializations (Comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.specialization.join(', ')}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium shadow-sm"
                                    placeholder="Luxury, Commercial, Penthouses"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Section: Buyer */}
                {userRoles.includes('BUYER') && (
                    <div>
                        <div className="flex items-center gap-3 mb-6 pt-6 border-t border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Buyer Preferences</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100/50">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Budget Min (&#8377;)</label>
                                <input
                                    type="number"
                                    value={formData.budgetMin}
                                    onChange={(e) => setFormData({ ...formData, budgetMin: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Budget Max (&#8377;)</label>
                                <input
                                    type="number"
                                    value={formData.budgetMax}
                                    onChange={(e) => setFormData({ ...formData, budgetMax: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium shadow-sm"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Preferred Locations</label>
                                <input
                                    type="text"
                                    value={formData.preferredLocations.join(', ')}
                                    onChange={(e) => setFormData({ ...formData, preferredLocations: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium shadow-sm"
                                    placeholder="Bandra, Worli, Juhu"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Section: Growth Partner */}
                {userRoles.includes('GROWTH_PARTNER') && (
                    <div>
                        <div className="flex items-center gap-3 mb-6 pt-6 border-t border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Growth Partner Profile</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-purple-50/30 p-6 rounded-2xl border border-purple-100/50">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Campaign Budget Limit (&#8377;)</label>
                                <input
                                    type="number"
                                    value={formData.campaignBudgetLimit}
                                    onChange={(e) => setFormData({ ...formData, campaignBudgetLimit: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Niche</label>
                                <input
                                    type="text"
                                    value={formData.niche}
                                    onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium shadow-sm"
                                    placeholder="Lifestyle, Real Estate"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Reach (Followers)</label>
                                <input
                                    type="number"
                                    value={formData.reach}
                                    onChange={(e) => setFormData({ ...formData, reach: parseInt(e.target.value) || 0 })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}



                <div className="pt-8 border-t border-gray-100 flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="px-6 py-3.5 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && (
                            <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                        )}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
