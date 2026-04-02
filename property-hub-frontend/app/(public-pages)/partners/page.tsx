'use client';

import Navbar from '@/app/components/Navbar';
import Link from 'next/link';

export default function PartnersPage() {
    const partnerRoles = [
        {
            id: 'PROPERTY_PARTNER',
            title: 'Property Partner',
            subtitle: 'For Builders & Developers',
            description: 'List your inventory on India\'s most advanced real estate ecosystem and connect with thousands of pre-verified buyers.',
            icon: '🏢',
            color: 'from-blue-600 to-indigo-600',
            benefits: [
                'Bulk Inventory Management',
                'Advanced CRM for Lead Tracking',
                'Pre-verified Buyer Leads',
                'Direct-to-Buyer Communication',
                'Market Insights & Analytics'
            ]
        },
        {
            id: 'GROWTH_PARTNER',
            title: 'Growth Partner',
            subtitle: 'For Influencers & Marketers',
            description: 'Monetize your network by promoting premium properties and collaborating on high-impact marketing campaigns.',
            icon: '📈',
            color: 'from-purple-600 to-pink-600',
            benefits: [
                'High Affiliate Commissions',
                'Sponsored Content Opportunities',
                'Exclusive Early Project Access',
                'Dedicated Support Team',
                'Real-time Earnings Dashboard'
            ]
        },
        {
            id: 'LOAN_PARTNER',
            title: 'Loan Partner',
            subtitle: 'For Banks & Financial Institutions',
            description: 'Help our buyers secure the best home loan deals and earn referral commissions for every successful disbursement.',
            icon: '🏦',
            color: 'from-green-600 to-teal-600',
            benefits: [
                'Direct Access to Homebuyers',
                'Quick Documentation & API integration',
                'Track Applications in Real-time',
                'Higher Approval Conversion Rate',
                'Flexible Commission Structure'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <header className="relative pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                </div>
                
                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
                        Empowering the Future of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Real Estate Partnerships
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Join India's most tech-driven ecosystem. Whether you're a developer, a content creator, or a financial institution, we have the tools to help you scale.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="#roles" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl">
                            Explore Roles
                        </a>
                        <Link href="/register" className="bg-white text-slate-900 border-2 border-slate-100 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                            Join Now
                        </Link>
                    </div>
                </div>
            </header>

            {/* Feature Cards Section */}
            <section id="roles" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Choose Your Partnership Path</h2>
                        <p className="mt-4 text-lg text-slate-600">Click on any role to start your journey with us.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {partnerRoles.map((role) => (
                            <div key={role.id} className="group flex flex-col bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 h-full">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} text-white flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                    {role.icon}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-1">{role.title}</h3>
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">{role.subtitle}</p>
                                <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
                                    {role.description}
                                </p>
                                <div className="space-y-3 mb-8">
                                    {role.benefits.map((benefit, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {benefit}
                                        </div>
                                    ))}
                                </div>
                                <Link 
                                    href={`/register?role=${role.id}`}
                                    className={`w-full text-center py-4 rounded-xl text-white font-bold bg-gradient-to-r ${role.color} hover:brightness-110 transition-all active:scale-95`}
                                >
                                    Join as Partner
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Advantage Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-blue-600 font-black tracking-widest text-xs uppercase">Platform Benefits</span>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mt-4 mb-6 leading-tight">
                                Why Industry Leaders <br /> Prefer PropertyHub
                            </h2>
                            <p className="text-slate-600 text-lg mb-10 leading-relaxed">
                                Our platform is built by real estate professionals for real estate professionals. We've eliminated the friction in the ecosystem to help you focus on what you do best.
                            </p>
                            
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                                <div>
                                    <dt className="text-lg font-bold text-slate-900">Advanced Dashboard</dt>
                                    <dd className="mt-2 text-slate-500 text-sm">Real-time statistics, lead tracking, and revenue management all in one place.</dd>
                                </div>
                                <div>
                                    <dt className="text-lg font-bold text-slate-900">Priority Support</dt>
                                    <dd className="mt-2 text-slate-500 text-sm">Get dedicated relationship managers to help you navigate your partnership.</dd>
                                </div>
                                <div>
                                    <dt className="text-lg font-bold text-slate-900">Verified Database</dt>
                                    <dd className="mt-2 text-slate-500 text-sm">No cold calls. Access a database of users actively looking for property solutions.</dd>
                                </div>
                                <div>
                                    <dt className="text-lg font-bold text-slate-900">AI Matching</dt>
                                    <dd className="mt-2 text-slate-500 text-sm">Our AI matches properties with buyer profiles for significantly higher conversion.</dd>
                                </div>
                            </dl>
                        </div>
                        
                        <div className="relative">
                            <div className="bg-slate-100 rounded-3xl aspect-square overflow-hidden shadow-inner flex items-center justify-center text-8xl grayscale opacity-50">
                                📸
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100">
                                <div className="text-3xl font-black text-slate-900">95%</div>
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Client Satisfaction</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="py-24 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black md:text-5xl">Simple Onboarding Process</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-slate-800 -z-0"></div>
                        
                        {[
                            { step: '01', title: 'Choose & Apply', desc: 'Select your role and fill in your professional details.' },
                            { step: '02', title: 'Email Verification', desc: 'Verify your identity through our secure token-based process.' },
                            { step: '03', title: 'Start Scaling', desc: 'Access your dashboard and start listing or earning instantly.' }
                        ].map((item, i) => (
                            <div key={i} className="relative z-10 text-center">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-2xl font-black text-blue-500 mx-auto mb-6 border-4 border-slate-900">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                    <h2 className="text-[20rem] font-black uppercase text-slate-900 select-none">JOIN</h2>
                </div>
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-tight">
                        Ready to Transform Your <br /> Property Business?
                    </h2>
                    <Link href="/register" className="inline-block bg-blue-600 text-white px-12 py-5 rounded-3xl font-bold text-xl hover:bg-blue-700 transition-all hover:scale-105 shadow-2xl shadow-blue-200">
                        Become a Partner Today
                    </Link>
                    <p className="mt-8 text-slate-400 text-sm font-medium">Free to join. No hidden setup fees.</p>
                </div>
            </section>

            <footer className="py-12 border-t border-slate-100 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="font-black text-2xl text-slate-800 tracking-tight">PropertyHub</div>
                    <div className="flex gap-8 text-sm text-slate-400">
                        <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
                    </div>
                    <p className="text-slate-400 text-sm">© {new Date().getFullYear()} PropertyHub. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
