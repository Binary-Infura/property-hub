'use client';

import { useState } from 'react';

interface PropertyPartner {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName: string;
    projectsCount: number;
    status: 'active' | 'inactive';
}

export default function MyPropertyPartnersPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Mock Data (Scoped to this OM)
    const [builders, setPropertyPartners] = useState<PropertyPartner[]>([
        {
            id: 'b1',
            firstName: 'Rajesh',
            lastName: 'Kulkarni',
            email: 'rajesh@sunrise.com',
            phone: '+91 98765 11111',
            companyName: 'Sunrise Developers',
            projectsCount: 2,
            status: 'active',
        },
        {
            id: 'b2',
            firstName: 'Meera',
            lastName: 'Iyer',
            email: 'meera@skyhigh.com',
            phone: '+91 98765 22222',
            companyName: 'Sky High Constructions',
            projectsCount: 1,
            status: 'active',
        },
    ]);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Property Partners</h1>
                    <p className="text-gray-600 mt-2">Manage builders and developers under your portfolio.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2"
                >
                    <span>+</span> Add New Property Partner
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Partner / Company</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {builders.map((builder) => (
                            <tr key={builder.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                            {builder.companyName.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{builder.companyName}</div>
                                            <div className="text-xs text-gray-500">{builder.firstName} {builder.lastName}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{builder.email}</div>
                                    <div className="text-sm text-gray-500">{builder.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{builder.projectsCount} Projects</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${builder.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {builder.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                    <button className="text-gray-600 hover:text-gray-900">View Projects</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Add New Property Partner</h2>
                        <p className="text-gray-500 mb-6">Onboard a new builder to your network.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Property Partner</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
