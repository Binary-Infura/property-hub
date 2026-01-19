'use client';

import { useState } from 'react';

interface PropertyPartner {
    id: string;
    name: string;
    agencyName: string;
    email: string;
    phone: string;
    assignedProperties: number;
    status: 'active' | 'inactive';
}

export default function MyPropertyPartnersPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Mock Data (Scoped to this OM)
    const [partners, setPartners] = useState<PropertyPartner[]>([
        {
            id: 'pp1',
            name: 'Suresh Real Estate',
            agencyName: 'Suresh Homes',
            email: 'suresh@agency.com',
            phone: '+91 98765 99887',
            assignedProperties: 5,
            status: 'active',
        },
        {
            id: 'pp3',
            name: 'Priya Consultants',
            agencyName: 'Priya Realty',
            email: 'priya@realty.com',
            phone: '+91 98765 44332',
            assignedProperties: 3,
            status: 'active',
        },
    ]);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Property Partners</h1>
                    <p className="text-gray-600 mt-2">Manage partners reporting to you.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2"
                >
                    <span>+</span> Add New Partner
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map((partner) => (
                    <div key={partner.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                                {partner.agencyName.charAt(0)}
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${partner.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {partner.status}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1">{partner.agencyName}</h3>
                        <p className="text-sm text-gray-500 mb-4">Rep: {partner.name}</p>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center text-sm text-gray-600 gap-2">
                                <span>📧</span> {partner.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 gap-2">
                                <span>📞</span> {partner.phone}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 gap-2">
                                <span>🏠</span> {partner.assignedProperties} Properties Assigned
                            </div>
                        </div>

                        <div className="mt-auto flex gap-2">
                            <button className="flex-1 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition">
                                View Profile
                            </button>
                            <button className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition">
                                Assign Properties
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Add New Partner</h2>
                        <p className="text-gray-500 mb-6">Create a new partner account under your supervision.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
