'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { propertyService, Property, PropertyType } from '@/app/services/propertyService';

export default function OnboardingPropertiesPage() {
    const { token } = useAuth();
    const { activeContext } = useUnifiedApp();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');

    const fetchProperties = async () => {
        if (!token || activeContext.activeRegion.code === 'no-region') return;
        try {
            setLoading(true);
            const data = await propertyService.getAll(
                token,
                activeContext.activeRegion.code,
                activeTab === 'my'
            );
            setProperties(data);
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, [token, activeContext.activeRegion.code, activeTab]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Properties Inventory</h1>
                    <p className="text-gray-600 mt-1">Manage and track property onboarding across regions.</p>
                </div>
                <button
                    onClick={() => { const el = document.getElementById('pom-add-property-modal'); if (el) el.classList.remove('hidden'); }}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Onboard New Property
                </button>
            </div>

            {/* Tabs */}
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
                    All Properties ({activeContext.activeRegion.name})
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property Details</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type & Price</th>
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
                                            <span>Loading inventory...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : properties.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                                        No properties found.
                                    </td>
                                </tr>
                            ) : properties.map((property) => (
                                <tr key={property.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">{property.name}</span>
                                            <span className="text-xs text-gray-500">{property.location}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-700">{property.propertyType}</span>
                                            <span className="text-xs font-semibold text-blue-600">₹{(Number(property.price) / 100000).toFixed(2)} Lacs</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-900 font-medium">{property.onboardedBy?.name || 'Unknown'}</span>
                                            <span className="text-xs text-gray-500">{new Date(property.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${property.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                            property.status === 'RESERVED' ? 'bg-blue-100 text-blue-700' :
                                                property.status === 'UNDER_CONSTRUCTION' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {property.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex justify-end gap-3">
                                            {activeTab === 'my' && (
                                                <button className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">Edit</button>
                                            )}
                                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Onboard New Property Modal */}
            <div id="pom-add-property-modal" className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 hidden">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Onboard New Property</h2>
                            <p className="text-sm text-gray-500 mt-1">Enter property details to onboard into the system.</p>
                        </div>
                        <button
                            onClick={() => { const el = document.getElementById('pom-add-property-modal'); if (el) el.classList.add('hidden'); }}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Name</label>
                                <input
                                    id="prop-name"
                                    type="text"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                                    placeholder="e.g. Sunset Heights"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Type</label>
                                <select id="prop-type" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm">
                                    <option value="APARTMENT">Apartment</option>
                                    <option value="VILLA">Villa</option>
                                    <option value="PLOT">Plot</option>
                                    <option value="COMMERCIAL">Commercial</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                                <input
                                    id="prop-location"
                                    type="text"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                                    placeholder="Area, City"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (Numerical)</label>
                                <input
                                    id="prop-price"
                                    type="number"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                                    placeholder="e.g. 7500000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Area (sq.ft)</label>
                                <input
                                    id="prop-area"
                                    type="number"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                                    placeholder="e.g. 1200"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => { const el = document.getElementById('pom-add-property-modal'); if (el) el.classList.add('hidden'); }}
                                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!token || activeContext.activeRegion.code === 'no-region') return;
                                    try {
                                        const payload = {
                                            name: (document.getElementById('prop-name') as HTMLInputElement).value,
                                            propertyType: (document.getElementById('prop-type') as HTMLSelectElement).value as PropertyType,
                                            location: (document.getElementById('prop-location') as HTMLInputElement).value,
                                            price: Number((document.getElementById('prop-price') as HTMLInputElement).value),
                                            area: Number((document.getElementById('prop-area') as HTMLInputElement).value),
                                            regionId: activeContext.activeRegion.id,
                                        };
                                        await propertyService.create(payload, token, activeContext.activeRegion.code);
                                        const el = document.getElementById('pom-add-property-modal');
                                        if (el) el.classList.add('hidden');
                                        fetchProperties();
                                    } catch (err: any) {
                                        alert(err.message || 'Failed to onboard property');
                                    }
                                }}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 text-sm"
                            >
                                Submit Property
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
