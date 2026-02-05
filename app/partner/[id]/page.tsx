'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { userService, User } from '@/app/services/userService';
import { propertyService, Property } from '@/app/services/propertyService';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import PropertySearchCard from '@/app/components/PropertySearchCard';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';

export default function PartnerBusinessPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const { token } = useAuth();
    const { activeContext } = useUnifiedApp();

    const [partner, setPartner] = useState<User | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                setLoading(true);
                // Fetch partner details
                const partnerData = await userService.getById(id, token);
                setPartner(partnerData);

                // Fetch partner's properties
                const allProps = await propertyService.getAll(token, activeContext.activeRegion.code, false);
                setProperties(allProps.filter(p => p.onboardedById === id));
            } catch (error) {
                console.error('Failed to fetch business page data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, token, activeContext.activeRegion.code]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!partner) {
        return <div className="p-20 text-center font-bold">Partner not found</div>;
    }

    return (
        <div className="min-h-screen bg-[#FDFDFF]">
            <Navbar />
            {/* Cinematic Business Header */}
            <div className="bg-white border-b border-slate-50 overflow-hidden relative">
                <div className="h-64 sm:h-80 bg-[#0F172A] relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#1E293B] via-[#0F172A] to-[#334155]"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -ml-48 -mb-48"></div>
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pb-12">
                    <div className="flex flex-col md:flex-row gap-8 sm:gap-12 -mt-24 sm:-mt-32 items-end">
                        <div className="relative group">
                            <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-[3rem] bg-white p-3 shadow-2xl relative z-10 ring-1 ring-slate-100">
                                <div className="w-full h-full rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-6xl font-black text-white shadow-inner">
                                    {partner.firstName.charAt(0)}
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 border-[6px] border-white rounded-full flex items-center justify-center shadow-xl z-20">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex-1 pb-2">
                            <div className="flex flex-wrap items-center gap-4 mb-3">
                                <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
                                    {partner.firstName} {partner.lastName}
                                </h1>
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-100 shadow-sm">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                                    Verified Platinum Partner
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-slate-400 mb-8 tracking-tight">
                                CEO @ {partner.propertyPartnerProfile?.companyName || 'Elite Property Solutions'}
                            </p>

                            <div className="flex flex-wrap gap-4 sm:gap-6">
                                {[
                                    { label: 'Client Rating', val: '4.9 / 5.0', icon: '⭐', color: 'amber' },
                                    { label: 'Total Listings', val: `${properties.length}+ Units`, icon: '🏘️', color: 'blue' },
                                    { label: 'Industry Exp', val: '12 Years', icon: '🏆', color: 'indigo' }
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all cursor-default group">
                                        <div className="text-2xl group-hover:scale-125 transition-transform">{stat.icon}</div>
                                        <div>
                                            <p className="text-lg font-black text-slate-900 leading-tight">{stat.val}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pb-4 w-full md:w-auto">
                            <button className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black tracking-tight shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-95">
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Business Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid lg:grid-cols-12 gap-16">
                    {/* Sidebar: Profile & Trust */}
                    <div className="lg:col-span-4 space-y-10">
                        <section className="bg-white rounded-[3rem] p-12 shadow-xl shadow-slate-100/50 border border-slate-50 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                            <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <span className="text-blue-600 text-3xl">“</span>
                                Professional Bio
                            </h2>
                            <p className="text-lg text-slate-500 font-bold leading-relaxed mb-10 italic">
                                "{partner.firstName} is a highly decorated property specialist with over a decade of experience in the luxury market. His commitment to legal transparency and client-first solutions has earned him a top-tier reputation across the region."
                            </p>

                            <div className="space-y-4">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-blue-200 transition-colors">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Corporate HQ</p>
                                    <p className="text-sm font-black text-slate-900 leading-relaxed">{partner.propertyPartnerProfile?.companyAddress || 'Luxury Towers, Floor 14, Business Bay, Mumbai'}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-blue-200 transition-colors">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">RERA Licensing</p>
                                    <p className="text-sm font-black text-slate-900">{partner.reraId || 'RE-0099-2288-11'}</p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-gradient-to-br from-indigo-900 to-[#0F172A] rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mb-32 -mr-32 group-hover:scale-125 transition-transform duration-1000"></div>

                            <div className="relative z-10 text-center">
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-4xl shadow-2xl">⚡</div>
                                <h4 className="text-3xl font-black mb-4 tracking-tight leading-tight">Elite Partner <br /> Privilege</h4>
                                <p className="text-slate-400 font-bold mb-10 text-lg leading-relaxed">Book a priority viewing with {partner.firstName} and get a personalized ROI report.</p>
                                <button className="w-full py-5 bg-white text-indigo-900 rounded-[1.5rem] font-black tracking-tight hover:shadow-2xl hover:-translate-y-1 transition-all">Claim Invite</button>
                            </div>
                        </section>
                    </div>

                    {/* Main Portfolio Layout */}
                    <div className="lg:col-span-8 space-y-12">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Portfolio Showcase</h2>
                                <p className="text-slate-400 font-bold text-lg">Curated listings by {partner.firstName}</p>
                            </div>
                            <div className="px-6 py-3 bg-slate-100 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] h-fit">
                                {properties.length} Active Listings
                            </div>
                        </div>

                        <div className="grid gap-12">
                            {properties.length === 0 ? (
                                <div className="bg-slate-50 rounded-[3rem] p-24 text-center border-4 border-dashed border-slate-100">
                                    <div className="text-6xl mb-6">🏜️</div>
                                    <p className="text-slate-400 font-black text-xl mb-2">No active listings currently available.</p>
                                    <p className="text-slate-300 font-bold tracking-tight">Check back soon for new premium properties.</p>
                                </div>
                            ) : (
                                properties.map(property => {
                                    const mapped = {
                                        id: property.id,
                                        title: property.name,
                                        config: `${property.bedrooms || 2} BHK`,
                                        location: property.location,
                                        area: `${property.area || 1200} sqft`,
                                        price: `₹${(Number(property.price) / 100000).toFixed(1)}L`,
                                        propertyType: (property.propertyType === 'APARTMENT' ? 'Flat' : property.propertyType === 'VILLA' ? 'Villa' : 'Plot') as any,
                                        bhk: `${property.bedrooms || 2} BHK`,
                                        isNew: true,
                                        isReadyToMove: property.status === 'AVAILABLE' || property.status === 'APPROVED',
                                        highlights: ['Premium Listing', 'Verified Owner'],
                                        legalVerified: true
                                    };
                                    return (
                                        <div key={property.id} className="hover:scale-[1.02] transition-all duration-500">
                                            <PropertySearchCard
                                                property={mapped}
                                                isShortlisted={false}
                                                isSelectedForCompare={false}
                                                onShortlist={() => { }}
                                                onToggleCompare={() => { }}
                                                onViewDetails={(pid) => router.push(`/search/${pid}`)}
                                            />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
