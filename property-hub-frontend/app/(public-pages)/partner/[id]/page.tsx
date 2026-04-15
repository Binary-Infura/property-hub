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
    const { token, user } = useAuth();
    const { activeContext } = useUnifiedApp();

    const [partner, setPartner] = useState<User | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch partner details
                const partnerData = await userService.getById(id, token || null);
                setPartner(partnerData);

                // Fetch partner's properties
                const response = await propertyService.getAll(token || null, false);
                const allProps = response.data || [];
                setProperties(allProps.filter(p => p.onboardedById === id));

                // Fetch follow status and count
                if (token) {
                    const following = await userService.isFollowing(id, token);
                    setIsFollowing(following);
                }
                const count = await userService.getFollowerCount(id);
                setFollowerCount(count);
            } catch (error) {
                console.error('Failed to fetch business page data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, token]);

    const handleFollow = async () => {
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            setFollowLoading(true);
            if (isFollowing) {
                await userService.unfollow(id, token);
                setIsFollowing(false);
                setFollowerCount(prev => Math.max(0, prev - 1));
            } else {
                await userService.follow(id, token);
                setIsFollowing(true);
                setFollowerCount(prev => prev + 1);
            }
        } catch (error) {
            console.error('Failed to toggle follow:', error);
        } finally {
            setFollowLoading(false);
        }
    };

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
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('/external-assets/020c795e10.png')] pointer-events-none"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pb-12">
                    <div className="flex flex-col md:flex-row gap-8 sm:gap-12 -mt-24 sm:-mt-32 items-end">
                        <div className="relative group">
                            <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-[3rem] bg-white p-3 shadow-2xl relative z-10 ring-1 ring-slate-100 italic">
                                {partner.avatarUrl ? (
                                    <img 
                                        src={partner.avatarUrl} 
                                        alt={partner.firstName} 
                                        className="w-full h-full rounded-[2.5rem] object-cover shadow-inner"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-6xl font-black text-white shadow-inner">
                                        {partner.firstName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 border-[6px] border-white rounded-full flex items-center justify-center shadow-xl z-20">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex-1 pb-2">
                            <div className="flex flex-wrap items-center gap-4 mb-3">
                                <h1 className="text-5xl font-black text-white tracking-tight leading-none italic uppercase">
                                    {(partner.profileData as any)?.companyName || `${partner.firstName} ${partner.lastName}`}
                                </h1>
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50/10 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-500/30 shadow-sm backdrop-blur-md">
                                    <span className={`w-2 h-2 ${(partner.profileData as any)?.isPremium ? 'bg-amber-400' : 'bg-blue-400'} rounded-full animate-pulse`}></span>
                                    {(partner.profileData as any)?.isPremium ? 'Verified Premium Member' : 'Verified Property Partner'}
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-slate-300 mb-8 tracking-tight">
                                {(partner.profileData as any)?.tagline || `Top-tier Real Estate Professional`}
                                { (partner.profileData as any)?.companyName && <span className="text-blue-400 ml-2">by {partner.firstName} {partner.lastName}</span> }
                            </p>

                            <div className="flex flex-wrap gap-4 sm:gap-6">
                                {[
                                    { label: 'Client Rating', val: `${partner.rating ? partner.rating + ' / 5.0' : '4.8 / 5.0'}`, svgIcon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>, color: 'amber' },
                                    { label: 'Total Listings', val: `${properties.length} Active`, svgIcon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" /></svg>, color: 'blue' },
                                    { label: 'Founded Year', val: `${(partner.profileData as any)?.foundedYear || '2015'}`, svgIcon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 3h.008v.008H12V18zm-3-3h.008v.008H9V15zm0 3h.008v.008H9V18zm6-3h.008v.008H15V15zm0 3h.008v.008H15V18z" /></svg>, color: 'indigo' },
                                    { label: 'Company Size', val: `${(partner.profileData as any)?.companySize || '11-50 employees'}`, svgIcon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.771m0 0a5.971 5.971 0 00-.941 3.197m0 0l.001.031c0 .225.012.447.037.666A11.944 11.944 0 0112 21c2.17 0 4.207-.576 5.963-1.584A6.062 6.062 0 0118 18.719m-12 0a5.971 5.971 0 00.941-3.197m0 0A5.995 5.995 0 0112 12.75a5.995 5.995 0 015.058 2.771m0 0a5.971 5.971 0 01.941 3.197M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>, color: 'blue' }
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all cursor-default group">
                                        <div className="text-slate-500 group-hover:scale-125 transition-transform">{stat.svgIcon}</div>
                                        <div>
                                            <p className="text-lg font-black text-slate-900 leading-tight">{stat.val}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pb-4 w-full md:w-auto">
                        {token && (
                            <button
                                onClick={handleFollow}
                                disabled={followLoading || user?.userId === id}
                                className={`w-full md:w-auto px-10 py-5 rounded-[2rem] font-black tracking-tight shadow-2xl transition-all flex items-center justify-center gap-3 ${user?.userId === id
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200 shadow-none'
                                        : isFollowing
                                            ? 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 hover:-translate-y-1 active:scale-95'
                                            : 'bg-slate-900 text-white hover:bg-blue-600 hover:-translate-y-1 active:scale-95'
                                    }`}>
                                {followLoading ? (
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                ) : user?.userId === id ? (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Your Profile
                                    </>
                                ) : (
                                    <>
                                        {isFollowing ? (
                                            <>
                                                <svg className="w-5 h-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Following
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                </svg>
                                                Follow
                                            </>
                                        )}
                                    </>
                                )}
                            </button>
                        )}

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
                                "{(partner.profileData as any)?.about || `${partner.firstName} is a highly decorated property specialist with over a decade of experience in the luxury market. His commitment to legal transparency and client-first solutions has earned him a top-tier reputation across the region.`}"
                            </p>

                            <div className="space-y-4">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-blue-200 transition-colors">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Corporate HQ</p>
                                    <p className="text-sm font-black text-slate-900 leading-relaxed">{(partner.profileData as any)?.companyAddress || 'Luxury Towers, Mumbai'}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-blue-200 transition-colors">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">RERA Licensing</p>
                                    <p className="text-sm font-black text-slate-900">{(partner.profileData as any)?.licenseNumber || partner.reraId || 'Verified'}</p>
                                </div>
                                {(partner.profileData as any)?.website && (
                                    <a 
                                        href={(partner.profileData as any).website.startsWith('http') ? (partner.profileData as any).website : `https://${(partner.profileData as any).website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 group hover:bg-blue-600 hover:text-white transition-all block"
                                    >
                                        <p className="text-[10px] font-black text-blue-400 group-hover:text-blue-100 uppercase tracking-widest mb-2">Official Website</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-black truncate max-w-[180px]">{(partner.profileData as any).website.replace(/^https?:\/\//, '')}</p>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>
                                    </a>
                                )}
                            </div>
                        </section>

                        {(partner.profileData as any)?.specialties && (
                            <section className="bg-white rounded-[3rem] p-12 shadow-xl shadow-slate-100/50 border border-slate-50">
                                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                    Our Specialties
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {(Array.isArray((partner.profileData as any).specialties) 
                                        ? (partner.profileData as any).specialties 
                                        : (partner.profileData as any).specialties.split(',')
                                    ).map((s: string, i: number) => (
                                        <div key={i} className="px-5 py-2.5 bg-slate-50 text-slate-700 text-sm font-black rounded-full border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-default uppercase tracking-tight">
                                            # {s.trim()}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="bg-gradient-to-br from-indigo-900 to-[#0F172A] rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mb-32 -mr-32 group-hover:scale-125 transition-transform duration-1000"></div>

                            <div className="relative z-10 text-center">
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl text-blue-300">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>
                                </div>
                                <h4 className="text-3xl font-black mb-4 tracking-tight leading-tight">Elite Partner <br /> Privilege</h4>
                                <p className="text-slate-400 font-bold mb-10 text-lg leading-relaxed">Book a priority viewing with {partner.firstName} and get a personalized ROI report.</p>
                                <button className="w-full py-5 bg-white text-indigo-900 rounded-[1.5rem] font-black tracking-tight hover:shadow-2xl hover:-translate-y-1 transition-all">Claim Invite</button>
                            </div>
                        </section>
                    </div>

                    {/* Main Portfolio Layout */}
                    <div className="lg:col-span-8 space-y-12" >
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
                                    <div className="w-20 h-20 text-slate-300 flex items-center justify-center mx-auto mb-6">
                                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" /></svg>
                                    </div>
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
                                        propertyType: (property.projectType === 'APARTMENT' ? 'Flat' : property.projectType === 'VILLA' ? 'Villa' : 'Plot') as any,
                                        bhk: `${property.bedrooms || 2} BHK`,
                                        isNew: true,
                                        isReadyToMove: (property.status as string) === 'AVAILABLE' || (property.status as string) === 'APPROVED',
                                        highlights: ['Premium Listing', 'Verified Owner'],
                                        legalVerified: true,
                                        partner: partner ? { id: partner.id, name: `${partner.firstName || ''} ${partner.lastName || ''}`.trim() } : undefined
                                    };
                                    return (
                                        <div key={property.id} className="hover:scale-[1.02] transition-all duration-500">
                                            <PropertySearchCard
                                                property={mapped}
                                                isSelectedForCompare={false}
                                                onToggleCompare={() => { }}
                                                onViewDetails={(pid: string) => router.push(`/dashboard/search/${pid}`)}
                                            />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div></div></div></div>);
}
