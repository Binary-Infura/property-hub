'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { userService, User } from '@/app/services/userService';

export default function MyPropertyPartnersPage() {
    const { token } = useAuth();
    const { activeContext } = useUnifiedApp();
    const [partners, setPartners] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7; // Matching the UI height nicely

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
        companyAddress: '',
        taxId: '',
        licenseNumber: '',
    });
    const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
    const [isEdit, setIsEdit] = useState(false);

    const fetchPartners = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const result = await userService.getAllByRole(
                'property-partner',
                token,
                activeTab === 'my'
            );
            setPartners(result.data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch partners');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
        setCurrentPage(1); // Reset pagination on tab change
    }, [token, activeTab]);

    useEffect(() => {
        setCurrentPage(1); // Reset on search
    }, [searchQuery]);

    const handleOpenAdd = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            companyName: '',
            companyAddress: '',
            taxId: '',
            licenseNumber: '',
        });
        setIsEdit(false);
        setSelectedPartner(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (partner: User) => {
        setSelectedPartner(partner);
        setFormData({
            firstName: partner.firstName,
            lastName: partner.lastName || '',
            email: partner.email,
            phone: partner.phone || '',
            companyName: partner.propertyPartnerProfile?.companyName || partner.agencyName || '',
            companyAddress: partner.propertyPartnerProfile?.companyAddress || '',
            taxId: partner.propertyPartnerProfile?.taxId || '',
            licenseNumber: partner.propertyPartnerProfile?.licenseNumber || '',
        });
        setIsEdit(true);
        setIsAddModalOpen(true);
    };

    const handleOnboard = async () => {
        if (!token) return;
        try {
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.companyName) {
                alert('Please fill all required fields');
                return;
            }

            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                agencyName: formData.companyName,
                companyName: formData.companyName,
                companyAddress: formData.companyAddress,
                taxId: formData.taxId,
                licenseNumber: formData.licenseNumber,
                role: 'property-partner',
            };

            if (isEdit && selectedPartner) {
                await userService.update(selectedPartner.id, payload, token);
            } else {
                await userService.create(payload, token);
            }

            fetchPartners();
            setIsAddModalOpen(false);
        } catch (err: any) {
            alert(err.message || 'Failed to process property partner');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Property Partners</h1>
                    <p className="text-gray-600 mt-1">Manage builders and developers under your portfolio.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Onboard New Property Partner
                </button>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex bg-gray-100/50 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'my'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        My Onboardings
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'all'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        All Partners
                    </button>
                </div>

                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search partners, email, company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property Partner / Company</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Info</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Onboarded By</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Loading partners...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (() => {
                            const filtered = partners.filter(p => {
                                const searchStr = `${p.firstName} ${p.lastName} ${p.email} ${p.phone} ${p.propertyPartnerProfile?.companyName || ''} ${p.agencyName || ''} ${p.propertyPartnerProfile?.taxId || ''} ${p.propertyPartnerProfile?.licenseNumber || ''}`.toLowerCase();
                                return searchStr.includes(searchQuery.toLowerCase());
                            });

                            if (filtered.length === 0) {
                                return (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                            {searchQuery ? `No partners matching "${searchQuery}"` : 'No property partners found.'}
                                        </td>
                                    </tr>
                                );
                            }

                            const totalPages = Math.ceil(filtered.length / itemsPerPage);
                            const startIndex = (currentPage - 1) * itemsPerPage;
                            const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

                            return (
                                <>
                                    {paginatedData.map((partner) => (
                                        <tr key={partner.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold shadow-sm">
                                                        {(partner.propertyPartnerProfile?.companyName || partner.agencyName || partner.firstName || 'P').charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900">{partner.propertyPartnerProfile?.companyName || partner.agencyName || 'No Agency'}</div>
                                                        <div className="text-xs text-gray-500">{partner.firstName} {partner.lastName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-900 font-medium">{partner.email}</span>
                                                    <span className="text-xs text-gray-500">{partner.phone}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    {partner.propertyPartnerProfile?.taxId && (
                                                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded w-fit font-medium">PAN: {partner.propertyPartnerProfile.taxId}</span>
                                                    )}
                                                    {partner.propertyPartnerProfile?.licenseNumber && (
                                                        <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded w-fit font-medium">RERA: {partner.propertyPartnerProfile.licenseNumber}</span>
                                                    )}
                                                    {!partner.propertyPartnerProfile?.taxId && !partner.propertyPartnerProfile?.licenseNumber && (
                                                        <span className="text-xs text-gray-400 italic">Not set</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-900 font-medium">{(partner as any).onboardedBy?.firstName ? `${(partner as any).onboardedBy.firstName} ${(partner as any).onboardedBy.lastName || ''}` : 'System'}</span>
                                                    <span className="text-xs text-gray-500">{new Date(partner.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${partner.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {partner.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {activeTab === 'my' && (
                                                        <button
                                                            onClick={() => handleOpenEdit(partner)}
                                                            className="text-blue-600 hover:text-blue-800 font-bold transition-colors"
                                                        >
                                                            Edit Info
                                                        </button>
                                                    )}
                                                    <button className="text-gray-600 hover:text-gray-900 transition-colors font-medium">View Projects</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-500 font-medium">
                                                        Showing <span className="text-gray-900">{startIndex + 1}</span> to <span className="text-gray-900">{Math.min(startIndex + itemsPerPage, filtered.length)}</span> of <span className="text-gray-900">{filtered.length}</span> partners
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                            disabled={currentPage === 1}
                                                            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                            </svg>
                                                        </button>
                                                        <div className="flex items-center gap-1">
                                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                                <button
                                                                    key={page}
                                                                    onClick={() => setCurrentPage(page)}
                                                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === page
                                                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                                        }`}
                                                                >
                                                                    {page}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                            disabled={currentPage === totalPages}
                                                            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            );
                        })()}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Update Business Information' : 'Onboard New Property Partner'}</h2>
                                <p className="text-sm text-gray-500 mt-1">{isEdit ? `Editing details for ${formData.companyName}` : 'Onboard a new builder to your network.'}</p>
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

                        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-2">
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Basic Contact Info</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name *</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name *</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                                        placeholder="Enter last name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled={isEdit}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400 ${isEdit ? 'bg-gray-50 text-gray-500' : ''}`}
                                        placeholder="builder@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                <div className="col-span-2 pt-2 border-t border-gray-100">
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Business Details</p>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Name *</label>
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                                        placeholder="Enter company/firm name"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Address</label>
                                    <textarea
                                        value={formData.companyAddress}
                                        onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400 min-h-[80px]"
                                        placeholder="Full business address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tax ID / PAN</label>
                                    <input
                                        type="text"
                                        value={formData.taxId}
                                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                                        placeholder="GSTIN or PAN"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">RERA / License No.</label>
                                    <input
                                        type="text"
                                        value={formData.licenseNumber}
                                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                                        placeholder="Ex: PRM/KA/RERA/..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleOnboard}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 text-sm"
                                >
                                    {isEdit ? 'Update Information' : 'Onboard Property Partner'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
