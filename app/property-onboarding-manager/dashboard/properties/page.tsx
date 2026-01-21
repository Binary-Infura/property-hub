'use client';

import { useState } from 'react';

interface Property {
    id: string;
    title: string;
    location: string;
    type: string;
    status: 'active' | 'pending' | 'sold';
    managedByPartner: string | null; // Partner ID or null
    onboardedBy: { name: string; role: 'Property Partner' | 'Onboarding Manager' | 'Property Partner' };
}

export default function MyPropertiesPage() {
    // Mock Data (Onboarded by this OM)
    const [properties, setProperties] = useState<Property[]>([
        {
            id: 'p1',
            title: 'Sunset Heights',
            location: 'Andheri West, Mumbai',
            type: '3BHK Apartment',
            status: 'active',
            managedByPartner: 'pp1',
            onboardedBy: { name: 'Ravi Verma', role: 'Onboarding Manager' },
        },
        {
            id: 'p2',
            title: 'Green Valley Villa 4',
            location: 'Powai, Mumbai',
            type: '4BHK Villa',
            status: 'pending',
            managedByPartner: null,
            onboardedBy: { name: 'Sunrise Developers', role: 'Property Partner' },
        },
        {
            id: 'p3',
            title: 'Ocean View',
            location: 'Worli, Mumbai',
            type: '2BHK Apartment',
            status: 'active',
            managedByPartner: 'pp3',
            onboardedBy: { name: 'Priya Realty', role: 'Property Partner' },
        },
    ]);

    // State for modal visibility
    const [showModal, setShowModal] = useState(false);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
                    <p className="text-gray-600 mt-2">Properties you have onboarded and manage.</p>
                </div>
                <button
                    onClick={() => { const el = document.getElementById('pom-add-property-modal'); if (el) el.classList.remove('hidden'); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2"
                >
                    <span>+</span> Onboard New Property
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Location</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Onboarded By</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Partner</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {properties.map((property) => (
                            <tr key={property.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900">{property.title}</div>
                                    <div className="text-xs text-gray-500">ID: {property.id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{property.type}</div>
                                    <div className="text-xs text-gray-500">{property.location}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{property.onboardedBy.name}</div>
                                    <div className="text-xs text-gray-500">{property.onboardedBy.role}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {property.managedByPartner ? (
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            Partner Assigned
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            Unassigned
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${property.status === 'active' ? 'bg-green-100 text-green-800' :
                                        property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {property.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                    <button className="text-gray-600 hover:text-gray-900">Manage</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Basic Add Property Modal Placeholder */}
            <div id="pom-add-property-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div className="bg-white rounded-lg p-8 max-w-md w-full">
                    <h2 className="text-xl font-bold mb-4">Onboard New Property</h2>
                    <p className="text-gray-500 mb-6">Enter property details to onboard.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => { const el = document.getElementById('pom-add-property-modal'); if (el) el.classList.add('hidden'); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                        <button onClick={() => { const el = document.getElementById('pom-add-property-modal'); if (el) el.classList.add('hidden'); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
