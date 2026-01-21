'use client';

import { useState } from 'react';

export default function RegionalManagersPage() {
    const [showAddForm, setShowAddForm] = useState(false);

    // Mock data - in production, this would come from API
    const regionalManagers = [
        {
            id: '1',
            name: 'Rajesh Kumar',
            email: 'rajesh.kumar@propertyhub.com',
            status: 'active',
            region: 'Mumbai South',
            properties: 450,
            leads: 1200,
            builders: 25,
            consultants: 18,
            joinedDate: '2024-01-10',
        },
        {
            id: '2',
            name: 'Simran Kaur',
            email: 'simran.kaur@propertyhub.com',
            status: 'active',
            region: 'Pune West',
            properties: 320,
            leads: 850,
            builders: 18,
            consultants: 12,
            joinedDate: '2024-02-15',
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Regional Managers</h1>
                <p className="text-gray-600 mt-1">Manage regional managers across all regions</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Regional Managers</div>
                    <div className="text-3xl font-bold text-gray-900">{regionalManagers.length}</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Active</div>
                    <div className="text-3xl font-bold text-green-600">
                        {regionalManagers.filter((m) => m.status === 'active').length}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Properties</div>
                    <div className="text-3xl font-bold text-blue-600">
                        {regionalManagers.reduce((sum, m) => sum + m.properties, 0)}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Leads</div>
                    <div className="text-3xl font-bold text-purple-600">
                        {regionalManagers.reduce((sum, m) => sum + m.leads, 0).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mb-6 flex justify-between items-center">
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search regional managers..."
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="all">All Regions</option>
                        <option value="mumbai-south">Mumbai South</option>
                        <option value="pune-west">Pune West</option>
                        <option value="bangalore-north">Bangalore North</option>
                        <option value="delhi-ncr">Delhi NCR</option>
                    </select>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium"
                >
                    + Add Regional Manager
                </button>
            </div>

            {/* Regional Managers List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Regional Manager
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Region
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Properties
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Leads
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Property Partners
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Consultants
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {regionalManagers.map((manager) => (
                                <tr key={manager.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {manager.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{manager.name}</div>
                                                <div className="text-sm text-gray-500">{manager.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${manager.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {manager.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                            {manager.region}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {manager.properties}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                                        {manager.leads.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {manager.builders}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {manager.consultants}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {manager.joinedDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            <button className="text-blue-600 hover:text-blue-800 font-medium">
                                                View Dashboard
                                            </button>
                                            <button className="text-purple-600 hover:text-purple-800 font-medium">Edit</button>
                                            <button
                                                className={`font-medium ${manager.status === 'active'
                                                    ? 'text-yellow-600 hover:text-yellow-800'
                                                    : 'text-green-600 hover:text-green-800'
                                                    }`}
                                            >
                                                {manager.status === 'active' ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Regional Manager Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Regional Manager</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter email address"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Region</label>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">Select region</option>
                                    <option value="mumbai-south">Mumbai South</option>
                                    <option value="pune-west">Pune West</option>
                                    <option value="bangalore-north">Bangalore North</option>
                                    <option value="hyderabad-tech">Hyderabad Tech City</option>
                                    <option value="delhi-ncr">Delhi NCR</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter temporary password"
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                                <div className="flex gap-2">
                                    <span className="text-blue-600">ℹ️</span>
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium mb-1">Regional Manager Permissions:</p>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            <li>Manage properties and users within assigned region</li>
                                            <li>Can create Property Partners, Consultants, Loan Advisers, etc.</li>
                                            <li>Approve properties and manage leads</li>
                                            <li>Access limited to assigned region only</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium"
                                >
                                    Create Regional Manager
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
