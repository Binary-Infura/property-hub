'use client';

import { useState } from 'react';

export default function CreativeExecutivesPage() {
    const [showAddForm, setShowAddForm] = useState(false);

    // Mock data
    const creativeExecutives = [
        {
            id: '1',
            name: 'Priya Sharma',
            email: 'priya.sharma@propertyhub.com',
            status: 'active',
            assignedProjects: 6,
            completedAssets: 124,
            pendingReviews: 8,
            approvalRate: 92,
            joinedDate: '2024-01-10',
        },
        {
            id: '2',
            name: 'Arjun Mehta',
            email: 'arjun.mehta@propertyhub.com',
            status: 'active',
            assignedProjects: 5,
            completedAssets: 98,
            pendingReviews: 5,
            approvalRate: 88,
            joinedDate: '2024-02-15',
        },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Creative Executives</h1>
                <p className="text-gray-600 mt-1">Manage your creative team members</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Executives</div>
                    <div className="text-3xl font-bold text-gray-900">{creativeExecutives.length}</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Active Projects</div>
                    <div className="text-3xl font-bold text-purple-600">
                        {creativeExecutives.reduce((sum, e) => sum + e.assignedProjects, 0)}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Completed Assets</div>
                    <div className="text-3xl font-bold text-gray-900">
                        {creativeExecutives.reduce((sum, e) => sum + e.completedAssets, 0)}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Pending Reviews</div>
                    <div className="text-3xl font-bold text-orange-600">
                        {creativeExecutives.reduce((sum, e) => sum + e.pendingReviews, 0)}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mb-6 flex justify-between items-center">
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search executives..."
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
                    + Add Creative Executive
                </button>
            </div>

            {/* Executives List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Executive
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Projects
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Completed Assets
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pending Reviews
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Approval Rate
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {creativeExecutives.map((executive) => (
                                <tr key={executive.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                                                {executive.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{executive.name}</div>
                                                <div className="text-sm text-gray-500">{executive.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${executive.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {executive.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {executive.assignedProjects}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {executive.completedAssets}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                                        {executive.pendingReviews}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {executive.approvalRate}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            <button className="text-purple-600 hover:text-purple-800 font-medium">Edit</button>
                                            <button className="text-blue-600 hover:text-blue-800 font-medium">
                                                Assign Task
                                            </button>
                                            <button
                                                className={`font-medium ${executive.status === 'active'
                                                        ? 'text-yellow-600 hover:text-yellow-800'
                                                        : 'text-green-600 hover:text-green-800'
                                                    }`}
                                            >
                                                {executive.status === 'active' ? 'Deactivate' : 'Activate'}
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Creative Executive</h2>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                    <option value="">Select specialization</option>
                                    <option value="graphic-design">Graphic Design</option>
                                    <option value="video-editing">Video Editing</option>
                                    <option value="copywriting">Copywriting</option>
                                    <option value="ui-ux">UI/UX Design</option>
                                </select>
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
                                    Add Executive
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
