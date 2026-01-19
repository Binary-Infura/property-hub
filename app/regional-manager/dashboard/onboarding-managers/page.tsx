'use client';

import { useState } from 'react';

interface OnboardingManager {
    id: string;
    name: string;
    email: string;
    phone: string;
    region: string;
    propertiesOnboarded: number;
    status: 'active' | 'inactive';
    joinedDate: string;
}

export default function OnboardingManagersPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Mock Data
    const [managers, setManagers] = useState<OnboardingManager[]>([
        {
            id: 'om1',
            name: 'Ravi Verma',
            email: 'ravi.v@propertyhub.com',
            phone: '+91 98765 12345',
            region: 'Mumbai South',
            propertiesOnboarded: 15,
            status: 'active',
            joinedDate: '2025-11-10',
        },
        {
            id: 'om2',
            name: 'Anjali Desai',
            email: 'anjali.d@propertyhub.com',
            phone: '+91 98765 67890',
            region: 'Pune Central',
            propertiesOnboarded: 8,
            status: 'active',
            joinedDate: '2025-12-05',
        },
    ]);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Property Onboarding Managers</h1>
                    <p className="text-gray-600 mt-2">Manage managers responsible for onboarding properties and partners.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2"
                >
                    <span>+</span> Add New Manager
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {managers.map((manager) => (
                            <tr key={manager.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                            {manager.name.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{manager.name}</div>
                                            <div className="text-xs text-gray-500">Joined {new Date(manager.joinedDate).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{manager.email}</div>
                                    <div className="text-sm text-gray-500">{manager.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                        {manager.region}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{manager.propertiesOnboarded} Properties</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${manager.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {manager.status}
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
                        <h2 className="text-2xl font-bold mb-6">Add Onboarding Manager</h2>
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
                                    Add Manager
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
