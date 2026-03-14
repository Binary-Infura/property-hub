'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUnifiedApp } from '../contexts/UnifiedAppContext';
import { userService } from '../services/userService';

export default function UserProfileDrawer() {
    const { profileStatus, refreshProfileStatus, user, token } = useAuth();
    const { isProfileOpen, setIsProfileOpen } = useUnifiedApp();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState<any>({
        firstName: '',
        lastName: '',
        phone: '',
        primaryRole: '',
        // Property Partner
        companyName: '',
        companyAddress: '',
        taxId: '',
        licenseNumber: '',

        // Consultant
        specialization: [],
        experienceYears: 0,
        // Buyer
        budgetMin: 0,
        budgetMax: 0,
        preferredLocations: [],
        // Influencer
        socialMediaLinks: {},
        reach: 0,
        niche: '',
        // Marketing Manager
        campaignBudgetLimit: 0,
        // Central Authority
        department: '',
        accessLevel: '',
    });

    useEffect(() => {
        if (!user || !profileStatus) return;

        const pp = profileStatus['PROPERTY_PARTNER']?.profileData || {};

        const co = profileStatus['CONSULTANT']?.profileData || {};
        const bu = profileStatus['BUYER']?.profileData || {};
        const inf = profileStatus['INFLUENCER']?.profileData || {};
        const mm = profileStatus['MARKETING_MANAGER']?.profileData || {};
        const ca = profileStatus['CENTRAL_AUTHORITY']?.profileData || {};

        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            primaryRole: user.primaryRole || '',
            // Property Partner
            companyName: pp.companyName || user.agencyName || '',
            companyAddress: pp.companyAddress || '',
            taxId: pp.taxId || '',
            licenseNumber: pp.licenseNumber || '',

            // Consultant
            specialization: co.specialization || [],
            experienceYears: co.experienceYears || 0,
            // Buyer
            budgetMin: bu.budgetMin || 0,
            budgetMax: bu.budgetMax || 0,
            preferredLocations: bu.preferredLocations || [],
            // Influencer
            socialMediaLinks: inf.socialMediaLinks || {},
            reach: inf.reach || 0,
            niche: inf.niche || '',
            // Marketing Manager
            campaignBudgetLimit: mm.campaignBudgetLimit || 0,
            // Central Authority
            department: ca.department || '',
            accessLevel: ca.accessLevel || '',
        });
    }, [user, profileStatus, isProfileOpen]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            setLoading(true);
            setMessage(null);

            // Prepare clean data for API
            const submissionData = { ...formData };

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

    if (!isProfileOpen) return null;

    const userRoles = (user?.roles || []) as string[];

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={() => setIsProfileOpen(false)}
            />

            {/* Sidebar drawer */}
            <div className="absolute inset-y-0 right-0 max-w-xl w-full flex">
                <div className="relative w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
                    {/* Header */}
                    <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">User Profile</h2>
                            <p className="text-sm text-gray-500 font-medium">Manage your personal and role-specific details.</p>
                        </div>
                        <button
                            onClick={() => setIsProfileOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
                        {message && (
                            <div className={`p-4 mb-8 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm font-bold">{message.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-10 pb-10">
                            {/* Section: Basic Information */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Basic Information</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">First Name</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                            placeholder="John"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Last Name</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                <div className="space-y-1.5 opacity-60">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        className="w-full px-4 py-3 bg-gray-100 border-none rounded-2xl text-sm font-medium cursor-not-allowed"
                                        disabled
                                    />
                                    <p className="text-[10px] text-gray-400 font-bold ml-1">Email cannot be changed from profile settings.</p>
                                </div>
                            </div>

                            {/* Section: Property Partner */}
                            {userRoles.includes('PROPERTY_PARTNER') && (
                                <div className="space-y-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Property Partner Details</h3>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Company Name</label>
                                        <input
                                            type="text"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                            placeholder="Legal entity name"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Company Address</label>
                                        <textarea
                                            value={formData.companyAddress}
                                            onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium min-h-[80px]"
                                            placeholder="Registered office address"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Tax ID / PAN</label>
                                            <input
                                                type="text"
                                                value={formData.taxId}
                                                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                                placeholder="TAX-ID-123"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">RERA License</label>
                                            <input
                                                type="text"
                                                value={formData.licenseNumber}
                                                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                                placeholder="REG-0000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}



                            {/* Section: Consultant */}
                            {userRoles.includes('CONSULTANT') && (
                                <div className="space-y-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Consultant Profile</h3>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Experience (Years)</label>
                                        <input
                                            type="number"
                                            value={formData.experienceYears}
                                            onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Specializations (Comma separated)</label>
                                        <input
                                            type="text"
                                            value={formData.specialization.join(', ')}
                                            onChange={(e) => setFormData({ ...formData, specialization: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                            placeholder="Luxury, Commercial, Penthouses"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Section: Buyer */}
                            {userRoles.includes('BUYER') && (
                                <div className="space-y-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Buyer Preferences</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Budget Min (&#8377;)</label>
                                            <input
                                                type="number"
                                                value={formData.budgetMin}
                                                onChange={(e) => setFormData({ ...formData, budgetMin: parseFloat(e.target.value) || 0 })}
                                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Budget Max (&#8377;)</label>
                                            <input
                                                type="number"
                                                value={formData.budgetMax}
                                                onChange={(e) => setFormData({ ...formData, budgetMax: parseFloat(e.target.value) || 0 })}
                                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Preferred Locations</label>
                                        <input
                                            type="text"
                                            value={formData.preferredLocations.join(', ')}
                                            onChange={(e) => setFormData({ ...formData, preferredLocations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                            placeholder="Bandra, Worli, Juhu"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Section: Influencer */}
                            {userRoles.includes('INFLUENCER') && (
                                <div className="space-y-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Influencer Profile</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Niche</label>
                                            <input
                                                type="text"
                                                value={formData.niche}
                                                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                                placeholder="Lifestyle, Real Estate"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Reach (Followers)</label>
                                            <input
                                                type="number"
                                                value={formData.reach}
                                                onChange={(e) => setFormData({ ...formData, reach: parseInt(e.target.value) || 0 })}
                                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section: Marketing Manager */}
                            {userRoles.includes('MARKETING_MANAGER') && (
                                <div className="space-y-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Marketing Management</h3>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Campaign Budget Limit (&#8377;)</label>
                                        <input
                                            type="number"
                                            value={formData.campaignBudgetLimit}
                                            onChange={(e) => setFormData({ ...formData, campaignBudgetLimit: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Section: Central Authority */}
                            {userRoles.includes('CENTRAL_AUTHORITY') && (
                                <div className="space-y-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Authority Admin</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Department</label>
                                            <input
                                                type="text"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                                placeholder="Compliance, Sales, Admin"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Access Level</label>
                                            <input
                                                type="text"
                                                value={formData.accessLevel}
                                                onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                                placeholder="Super Admin, Manager"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                        </form>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 sticky bottom-0 z-10">
                        <button
                            type="button"
                            onClick={() => setIsProfileOpen(false)}
                            className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && (
                                <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                            )}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
            `}</style>
        </div>
    );
}
