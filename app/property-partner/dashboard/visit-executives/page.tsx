'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import PremiumLockedOverlay from '@/app/components/property-partner/PremiumLockedOverlay';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { userService, User } from '@/app/services/userService';

export default function VisitExecutivesPage() {
    const { token, profileStatus } = useAuth();
    const isPremium = profileStatus?.['property-partner']?.profileData?.isPremium;
    const { activeContext } = useUnifiedApp();
    const [executives, setExecutives] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchExecutives = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const result = await userService.getAllByRole(
                'visit-executive',
                token,
                true // Always personal view
            );
            setExecutives(result.data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch visit executives');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExecutives();
    }, [token]);

    if (!isPremium) {
        return <PremiumLockedOverlay title="Visit Executives" description="Coordinate site visits seamlessly by managing your field executives with our premium tools." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Visit Executives</h1>
                    <p className="text-gray-600 mt-1">Manage staff responsible for property site visits.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Onboard New Executive
                </button>
            </div>


            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Executive</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Onboarded By</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Loading executives...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : executives.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                                    No visit executives found.
                                </td>
                            </tr>
                        ) : executives.map((executive) => (
                            <tr key={executive.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-700 font-bold shadow-sm">
                                            {(executive.firstName || 'E').charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-gray-900">{executive.firstName} {executive.lastName}</div>
                                            <div className="text-xs text-gray-500">{executive.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-900 font-medium">{executive.phone || 'N/A'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-900 font-medium">{(executive as any).onboardedBy?.name || 'Unknown'}</span>
                                        <span className="text-xs text-gray-500">{new Date(executive.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${executive.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {executive.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex justify-end gap-3">
                                        <button className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">Edit</button>
                                        <button className="text-gray-600 hover:text-gray-900 transition-colors font-medium">View Visits</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Onboard Visit Executive</h2>
                                <p className="text-sm text-gray-500 mt-1">Add a new executive for site visits.</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                                        <input
                                            type="text"
                                            id="executive-firstName"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                                        <input
                                            type="text"
                                            id="executive-lastName"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        id="executive-email"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                                        placeholder="executive@propertyhub.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="executive-phone"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!token) return;
                                        try {
                                            const firstName = (document.getElementById('executive-firstName') as HTMLInputElement)?.value;
                                            const lastName = (document.getElementById('executive-lastName') as HTMLInputElement)?.value;
                                            const email = (document.getElementById('executive-email') as HTMLInputElement)?.value;
                                            const phone = (document.getElementById('executive-phone') as HTMLInputElement)?.value;

                                            if (!firstName || !lastName || !email || !phone) {
                                                alert('Please fill all fields');
                                                return;
                                            }

                                            const payload = {
                                                firstName,
                                                lastName,
                                                email,
                                                phone,
                                                role: 'visit-executive',
                                            };

                                            await userService.create(payload, token);
                                            fetchExecutives();
                                            setIsAddModalOpen(false);
                                        } catch (err: any) {
                                            alert(err.message || 'Failed to onboard visit executive');
                                        }
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 text-sm"
                                >
                                    Onboard Executive
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
