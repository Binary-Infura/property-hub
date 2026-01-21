'use client';

import { useState } from 'react';

export default function MarketingLeadsPage() {
    const [showAddForm, setShowAddForm] = useState(false);

    // Mock data
    const marketingLeads = [
        {
            id: '1',
            name: 'Amit Patel',
            email: 'amit.patel@propertyhub.com',
            status: 'active',
            teamSize: 6,
            campaigns: 3,
            leadsGenerated: 250,
            tasksCompleted: 28,
            tasksPending: 4,
            teamPerformance: 'excellent',
            joinedDate: '2023-12-01',
        },
        {
            id: '2',
            name: 'Kavita Desai',
            email: 'kavita.desai@propertyhub.com',
            status: 'active',
            teamSize: 5,
            campaigns: 4,
            leadsGenerated: 320,
            tasksCompleted: 35,
            tasksPending: 6,
            teamPerformance: 'good',
            joinedDate: '2024-01-20',
        },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Marketing Leads</h1>
                <p className="text-gray-600 mt-1">Manage your marketing team leads</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Leads</div>
                    <div className="text-3xl font-bold text-gray-900">{marketingLeads.length}</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Team Members</div>
                    <div className="text-3xl font-bold text-blue-600">
                        {marketingLeads.reduce((sum, e) => sum + e.teamSize, 0)}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Active Campaigns</div>
                    <div className="text-3xl font-bold text-gray-900">
                        {marketingLeads.reduce((sum, e) => sum + e.campaigns, 0)}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Leads Generated</div>
                    <div className="text-3xl font-bold text-green-600">
                        {marketingLeads.reduce((sum, e) => sum + e.leadsGenerated, 0)}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mb-6 flex justify-between items-center">
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search leads..."
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                    + Add Marketing Lead
                </button>
            </div>

            {/* Leads List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lead
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Team Size
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Campaigns
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Leads Generated
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tasks
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Performance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {marketingLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                                                {lead.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{lead.name}</div>
                                                <div className="text-sm text-gray-500">{lead.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${lead.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {lead.teamSize} members
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.campaigns}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {lead.leadsGenerated}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div>{lead.tasksCompleted} completed</div>
                                        <div className="text-xs text-gray-500">{lead.tasksPending} pending</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${lead.teamPerformance === 'excellent'
                                                    ? 'bg-green-100 text-green-800'
                                                    : lead.teamPerformance === 'good'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                        >
                                            {lead.teamPerformance}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            <button className="text-purple-600 hover:text-purple-800 font-medium">Edit</button>
                                            <button className="text-blue-600 hover:text-blue-800 font-medium">
                                                View Team
                                            </button>
                                            <button
                                                className={`font-medium ${lead.status === 'active'
                                                        ? 'text-yellow-600 hover:text-yellow-800'
                                                        : 'text-green-600 hover:text-green-800'
                                                    }`}
                                            >
                                                {lead.status === 'active' ? 'Deactivate' : 'Activate'}
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

            {/* Add Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Marketing Lead</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter email address"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter phone number"
                                />
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
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                                >
                                    Add Lead
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
