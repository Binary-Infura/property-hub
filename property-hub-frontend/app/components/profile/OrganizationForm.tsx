'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { userService } from '@/app/services/userService';

export default function OrganizationForm() {
    const { profileStatus, refreshProfileStatus, user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState<any>({
        companyName: '',
        companyAddress: '',
        taxId: '',
        licenseNumber: '',
        tagline: '',
        about: '',
        website: '',
        industry: '',
        companySize: '',
        headquarters: '',
        foundedYear: '',
        specialties: [],
    });

    useEffect(() => {
        if (!user || !profileStatus) return;
        const pp = profileStatus['PROPERTY_PARTNER']?.profileData || {};

        setFormData({
            companyName: pp.companyName || user.agencyName || '',
            companyAddress: pp.companyAddress || '',
            taxId: pp.taxId || '',
            licenseNumber: pp.licenseNumber || '',
            tagline: pp.tagline || '',
            about: pp.about || '',
            website: pp.website || '',
            industry: pp.industry || '',
            companySize: pp.companySize || '',
            headquarters: pp.headquarters || '',
            foundedYear: pp.foundedYear || '',
            specialties: pp.specialties || [],
        });
    }, [user, profileStatus]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            setLoading(true);
            setMessage(null);

            // Wrap data in profileData as per backend requirements
            const submissionData = {
                profileData: {
                    ...formData
                }
            };

            await userService.updateProfile(submissionData, token);
            await refreshProfileStatus();
            setMessage({ type: 'success', text: 'Organization details updated successfully!' });

            setTimeout(() => {
                setMessage(null);
            }, 3000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to update organization' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 max-w-5xl animate-in fade-in duration-500">
            {message && (
                <div className={`p-4 mb-8 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-bold">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-12">
                {/* Header / Brand Section */}
                <div className="relative group">
                    <div className="h-32 md:h-48 w-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl overflow-hidden relative shadow-inner">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    </div>
                    <div className="absolute -bottom-10 left-8 flex items-end gap-6">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-xl border-4 border-white flex items-center justify-center overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} className="w-full h-full object-cover" alt="Logo" />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Essential Branding */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Organization Name</label>
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    className="w-full text-2xl md:text-3xl font-black text-gray-900 bg-transparent border-none focus:ring-0 p-0 placeholder-gray-200"
                                    placeholder="Elite Property Solutions"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tagline</label>
                                <input
                                    type="text"
                                    value={formData.tagline}
                                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                    className="w-full text-lg font-bold text-blue-600 bg-transparent border-none focus:ring-0 p-0 placeholder-blue-100"
                                    placeholder="Building the future of real estate"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">About the Organization</label>
                            <textarea
                                value={formData.about}
                                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium min-h-[160px] leading-relaxed"
                                placeholder="Tell your organization's story..."
                            />
                        </div>

                        {/* Specialty Tags */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Specialties</label>
                            <input
                                type="text"
                                value={formData.specialties.join(', ')}
                                onChange={(e) => setFormData({ ...formData, specialties: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                placeholder="Luxury Villas, Commercial Spaces, Smart Homes"
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.specialties.map((tag: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-blue-100 italic">
                                        # {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Key Details Sidebar */}
                    <div className="space-y-6">
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100/50 space-y-6">
                            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Page Information</h4>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Website</label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-xs font-bold text-blue-600"
                                    placeholder="https://elite.com"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Industry</label>
                                <select
                                    value={formData.industry}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-xs font-bold text-gray-700"
                                >
                                    <option value="">Select Industry</option>
                                    <option value="Real Estate">Real Estate</option>
                                    <option value="Construction">Construction</option>
                                    <option value="Property Management">Property Management</option>
                                    <option value="Architecture">Architecture</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Company Size</label>
                                <select
                                    value={formData.companySize}
                                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-xs font-bold text-gray-700"
                                >
                                    <option value="">Select Size</option>
                                    <option value="1-10">1-10 employees</option>
                                    <option value="11-50">11-50 employees</option>
                                    <option value="51-200">51-200 employees</option>
                                    <option value="201-500">201-500 employees</option>
                                    <option value="500+">500+ employees</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Founded Year</label>
                                <input
                                    type="number"
                                    value={formData.foundedYear}
                                    onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-xs font-bold text-gray-700"
                                    placeholder="2012"
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 space-y-6">
                            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest mb-4 italic">Verification & Registration</h4>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest ml-1">Tax ID / PAN</label>
                                <input
                                    type="text"
                                    value={formData.taxId}
                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-gray-700"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest ml-1">RERA License</label>
                                <input
                                    type="text"
                                    value={formData.licenseNumber}
                                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-gray-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Locations Section */}
                <div className="pt-8 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-black text-gray-900 tracking-tight">Main Headquarters</h3>
                        </div>
                    </div>
                    <textarea
                        value={formData.companyAddress}
                        onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium min-h-[100px]"
                        placeholder="Registered office address"
                    />
                </div>

                <div className="pt-10 flex items-center justify-end gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center gap-2 group"
                    >
                        {loading ? (
                             <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                             </svg>
                        ) : (
                            <svg className="w-5 h-5 text-blue-200 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        Publish Page Changes
                    </button>
                </div>
            </form>
        </div>
    );
}

