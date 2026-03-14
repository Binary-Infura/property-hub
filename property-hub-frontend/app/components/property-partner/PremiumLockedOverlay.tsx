import Link from 'next/link';

interface PremiumLockedOverlayProps {
    title: string;
    description: string;
}

export default function PremiumLockedOverlay({ title, description }: PremiumLockedOverlayProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 bg-[#2563EB] rounded-[32px] m-4 text-white p-8 shadow-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
            </div>

            <div className="z-10 relative max-w-3xl mx-auto w-full">
                <div className="bg-white/20 p-5 rounded-3xl mb-8 inline-flex backdrop-blur-md shadow-inner border border-white/30">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Unlock Premium Access</h2>
                <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                    {description || `Get unlimited access to advanced tools, detailed analytics, and exclusive partner features with our Premium Plan.`}
                </p>

                {/* Plan Details Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-10 text-left border border-white/20 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-3">
                            Feature Included in Premium
                        </h3>
                        <span className="bg-[#fbbf24] text-amber-900 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">Recommended</span>
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-base">
                        {[
                            'Advanced Portfolio Analytics',
                            'Unlimited Team Members',
                            'Priority Partner Support',
                            'Custom Lead Reports',
                            'API Access Integration',
                            'White-label Reporting'
                        ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-white font-medium">
                                <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                    <Link href="/dashboard/subscription" className="w-full sm:w-auto px-10 py-4 bg-white text-[#2563EB] font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:bg-gray-50 hover:scale-[1.02] transition-all transform flex items-center justify-center gap-2 text-lg">
                        <span>Subscribe Now</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                    <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-[#1e40af]/30 text-white font-semibold rounded-2xl border border-blue-400/30 hover:bg-[#1e40af]/50 transition-colors backdrop-blur-sm flex items-center justify-center">
                        Maybe Later
                    </Link>
                </div>
                <p className="mt-8 text-sm text-blue-200/80">
                    Trusted by 5,000+ Property Partners worldwide
                </p>
            </div>
        </div>
    );
}
