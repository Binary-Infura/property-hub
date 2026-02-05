'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { propertyService, Property } from '@/app/services/propertyService';
import { userService, User } from '@/app/services/userService';
import Link from 'next/link';

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const { token } = useAuth();
    const { activeContext } = useUnifiedApp();

    const [property, setProperty] = useState<Property | null>(null);
    const [owner, setOwner] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!token || activeContext.activeRegion.code === 'no-region') return;
            try {
                setLoading(true);
                const prop = await propertyService.getOne(id, token, activeContext.activeRegion.code);
                setProperty(prop);

                if (prop.onboardedById) {
                    const ownerData = await userService.getById(prop.onboardedById, token);
                    setOwner(ownerData);
                }
            } catch (error) {
                console.error('Failed to fetch property details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id, token, activeContext.activeRegion.code]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em] animate-pulse">Loading Experience...</p>
                </div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6 text-center">
                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 max-w-lg">
                    <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">🔎</div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Property Not Found</h2>
                    <p className="text-slate-500 font-bold mb-10 leading-relaxed text-lg">The listing you are searching for might have been moved or is no longer available in this region.</p>
                    <Link href="/search" className="inline-block px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black tracking-tight hover:scale-105 transition-all shadow-xl shadow-blue-100">Back to Discovery</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFF]">
            {/* Cinematic Header / Navigation */}
            <div className="bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
                    <button onClick={() => router.back()} className="group flex items-center gap-4 text-slate-900 hover:text-blue-600 transition-all font-black text-sm uppercase tracking-widest">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-300">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </div>
                        Back to Search
                    </button>
                    <div className="flex gap-4">
                        <button className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                        <button className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left SIDE: Main Content */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Hero Section */}
                        <div className="bg-slate-200 aspect-[16/10] sm:aspect-video rounded-[4rem] overflow-hidden relative shadow-2xl group border-[12px] border-white">
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                            <div className="absolute bottom-12 left-12 right-12 flex items-end justify-between">
                                <div className="flex gap-4">
                                    <span className="px-6 py-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.25em] rounded-2xl shadow-2xl backdrop-blur-md ring-1 ring-white/20">Verified Elite</span>
                                    {property.status === 'AVAILABLE' && <span className="px-6 py-3 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-[0.25em] rounded-2xl shadow-2xl backdrop-blur-md ring-1 ring-white/20">Ready to Move</span>}
                                </div>
                                <div className="flex gap-3">
                                    <button className="w-16 h-16 bg-white/20 backdrop-blur-2xl border border-white/30 text-white rounded-3xl flex items-center justify-center hover:bg-white hover:text-blue-600 transition-all duration-500 group">
                                        <svg className="w-7 h-7 group-hover:scale-125 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                    <button className="w-16 h-16 bg-white/20 backdrop-blur-2xl border border-white/30 text-white rounded-3xl flex items-center justify-center hover:bg-white hover:text-blue-600 transition-all duration-500">
                                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Property Details Header */}
                        <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-60"></div>

                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                                    <div className="flex-1">
                                        <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-6">{property.name}</h1>
                                        <div className="flex items-center gap-4 text-slate-500 font-bold bg-slate-50 w-fit px-6 py-3 rounded-[1.5rem] border border-slate-100 text-lg">
                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                            </div>
                                            {property.location}
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right bg-blue-600 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-200 text-white min-w-[240px]">
                                        <p className="text-[11px] font-black text-blue-100 uppercase tracking-[0.4em] mb-2">Market Price</p>
                                        <p className="text-5xl font-black">₹{(Number(property.price) / 100000).toFixed(1)}L</p>
                                        <p className="text-[10px] font-bold text-blue-100/60 mt-2 italic">*All Inclusive pricing estimate</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-slate-50 rounded-[3rem] border border-slate-100">
                                    {[
                                        { label: 'Configuration', val: `${property.bedrooms || 2} BHK`, icon: '🛏️' },
                                        { label: 'Sanitary', val: `${property.bathrooms || 2} Bath`, icon: '🚿' },
                                        { label: 'Carpet Area', val: `${property.area || 1200} sqft`, icon: '📐' },
                                        { label: 'Category', val: property.propertyType, icon: '🏠' }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center group hover:shadow-md transition-all">
                                            <span className="text-3xl mb-4 group-hover:scale-125 transition-transform duration-300">{stat.icon}</span>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                            <p className="text-xl font-black text-slate-900">{stat.val}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-16 grid md:grid-cols-5 gap-12">
                                    <div className="md:col-span-3">
                                        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                                            <span className="w-2.5 h-10 bg-blue-600 rounded-full"></span>
                                            Property Philosophy
                                        </h3>
                                        <p className="text-2xl text-slate-500 leading-[1.6] font-bold">
                                            {property.description || "Designed for those who appreciate the finer details of urban living. This residence offers an unparalleled sense of space and light, with expansive floor-to-ceiling windows and premium finishes throughout."}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2 bg-slate-50 rounded-[3rem] p-10 border border-slate-100">
                                        <h4 className="text-lg font-black text-slate-900 mb-6 tracking-tight">Key Highlights</h4>
                                        <ul className="space-y-5">
                                            {[
                                                'Vastu Compliant Architecture',
                                                'Premium Italian Flooring',
                                                'High-Efficiency Climate Control',
                                                'Smart Home Automation Ready',
                                                'Panoramic City View Balcony'
                                            ].map((h, i) => (
                                                <li key={i} className="flex items-center gap-4 text-slate-600 font-bold transition-all hover:translate-x-2">
                                                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm">{h}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cinematic Amenities */}
                        <div className="bg-[#0F172A] rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
                            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>

                            <div className="flex items-end justify-between mb-16 relative z-10">
                                <div>
                                    <h3 className="text-3xl font-black mb-4 flex items-center gap-5">
                                        <div className="w-16 h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] flex items-center justify-center text-2xl shadow-2xl">⚡</div>
                                        Elite Living Amenities
                                    </h3>
                                    <p className="text-slate-400 font-bold text-lg ml-20">Everything you need for a frictionless lifestyle.</p>
                                </div>
                                <div className="hidden sm:block text-right">
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em]">Verified Infrastructure</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                                {[
                                    { name: 'Sanctuary Spa', val: 'Ayurvedic Wellness', icon: '🧘' },
                                    { name: 'Crystal Pool', val: 'Olympic standard', icon: '🏊' },
                                    { name: 'Arctic Flow', val: 'RO Centralized', icon: '💧' },
                                    { name: 'Bio Guardian', val: '24/7 AI Security', icon: '🛡️' },
                                    { name: 'Eden Gardens', val: 'Bonsai Collection', icon: '🌳' },
                                    { name: 'Play Horizon', val: 'Interactive Zone', icon: '🎠' }
                                ].map((item, i) => (
                                    <div key={i} className="group p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 cursor-pointer">
                                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                                            <span className="text-3xl">{item.icon}</span>
                                        </div>
                                        <p className="text-base font-black text-white mb-2">{item.name}</p>
                                        <p className="text-xs font-bold text-slate-500 group-hover:text-blue-300 transition-colors uppercase tracking-widest">{item.val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right SIDE: Partner Business Profile */}
                    <div className="lg:col-span-4 space-y-12">
                        {/* Premium Partner Card */}
                        <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 sticky top-32 group overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 group-hover:w-4 transition-all duration-500"></div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12 text-center">Exclusive Listing By</p>

                            <div className="flex flex-col items-center text-center mb-12">
                                <div className="relative mb-8">
                                    <div className="w-36 h-36 rounded-[3rem] bg-indigo-600 flex items-center justify-center font-black text-4xl text-white shadow-2xl shadow-indigo-100 ring-[12px] ring-indigo-50 group-hover:scale-105 transition-transform duration-500">
                                        {(owner?.firstName || 'P').charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-emerald-500 border-[6px] border-white rounded-full flex items-center justify-center shadow-2xl">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <h4 className="text-4xl font-black text-slate-900 tracking-tighter mb-3 leading-none italic">{owner?.firstName} {owner?.lastName}</h4>
                                <div className="px-5 py-2 bg-indigo-50 rounded-full border border-indigo-100 mb-8">
                                    <p className="text-indigo-600 font-black uppercase text-[10px] tracking-widest">
                                        {owner?.propertyPartnerProfile?.companyName || 'Elite Property Solutions'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                    <span className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest">Trust Index 5.0</span>
                                </div>
                            </div>

                            <div className="space-y-5 mb-12">
                                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 group/item hover:bg-white hover:shadow-xl transition-all duration-300">
                                    <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-md group-hover/item:scale-110 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Line</p>
                                        <p className="text-slate-900 font-extrabold text-lg tracking-tight">{owner?.phone || '+91 98765 43210'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 group/item hover:bg-white hover:shadow-xl transition-all duration-300">
                                    <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-md group-hover/item:scale-110 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Corporate Email</p>
                                        <p className="text-slate-900 font-extrabold text-sm truncate tracking-tight">{owner?.email || 'sales@partner.com'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button className="w-full py-7 bg-indigo-600 text-white rounded-[2rem] font-black text-lg tracking-tight hover:scale-[1.02] hover:bg-blue-700 active:scale-95 transition-all shadow-2xl shadow-indigo-200">
                                    Inquire Now
                                </button>
                                <Link href={`/partner/${owner?.id}`} className="w-full py-7 bg-slate-900 text-white rounded-[2rem] font-black text-lg tracking-tight hover:scale-[1.02] hover:bg-black active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4">
                                    Business Profile
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                            </div>

                            <div className="mt-12 text-center">
                                <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em]">RERA REG: {owner?.reraId || 'PR77334455'}</p>
                            </div>
                        </div>

                        {/* Upsell Card */}
                        <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="relative z-10 text-center">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-3xl rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-4xl shadow-2xl border border-white/20">💎</div>
                                <h4 className="text-4xl font-black mb-6 tracking-tighter leading-none italic">PropertyHub <br /> Premium Plus</h4>
                                <p className="text-indigo-100 font-bold mb-10 text-lg leading-relaxed opacity-80">Unlock yield forecasts & historical neighborhood data.</p>
                                <button className="w-full py-6 bg-white text-indigo-700 rounded-[2rem] font-black tracking-widest text-sm uppercase hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95">Upgrade Strategy</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
