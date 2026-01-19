'use client';

import { useState } from 'react';

interface PropertyPartner {
    id: string;
    name: string;
    agencyName: string;
    email: string;
    phone: string;
    region: string;
    assignedProperties: number;
    status: 'active' | 'inactive';
    reportingTo: string; // ID of Onboarding Manager or RM
}

export default function PropertyPartnersPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Mock Data
    const [partners, setPartners] = useState<PropertyPartner[]>([
        {
            id: 'pp1',
            name: 'Suresh Real Estate',
            agencyName: 'Suresh Homes',
            email: 'suresh@agency.com',
            phone: '+91 98765 99887',
            region: 'Mumbai South',
            assignedProperties: 5,
            status: 'active',
            reportingTo: 'Ravi Verma (OM)',
        },
        {
            id: 'pp2',
            name: 'Urban Spaces',
            agencyName: 'Urban Spaces Ltd.',
            email: 'contact@urbanspaces.com',
            phone: '+91 98765 11223',
            region: 'Mumbai West',
            assignedProperties: 12,
            status: 'active',
            reportingTo: 'Regional Manager',
        },
    ]);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Property Partners</h1>
                    <p className="text-gray-600 mt-2">Manage partners who handle property sales and management.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2"
                >
                    <span>+</span> Add New Partner
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner / Agency</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporting To</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {partners.map((partner) => (
                            <tr key={partner.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold">
                                            {partner.agencyName.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{partner.agencyName}</div>
                                            <div className="text-xs text-gray-500">{partner.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{partner.email}</div>
                                    <div className="text-sm text-gray-500">{partner.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                        {partner.region}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{partner.assignedProperties} Properties</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-700 font-medium">{partner.reportingTo}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${partner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {partner.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                    <button className="text-gray-600 hover:text-gray-900">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-6">Add Property Partner</h2>
                        <div className="space-y-4">
                            <p className="text-gray-600 italic">Form implementation placeholder...</p>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Add Partner
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
