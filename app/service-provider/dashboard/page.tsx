'use client';

export default function ServiceProviderDashboardPage() {
    const stats = [
        { label: 'Total Jobs', value: '45', color: 'text-blue-600' },
        { label: 'Pending Requests', value: '3', color: 'text-yellow-600' },
        { label: 'Rating', value: '4.8', color: 'text-green-600' },
        { label: 'This Month', value: '₹45k', color: 'text-purple-600' },
    ];

    const recentRequests = [
        {
            id: '1',
            customer: 'Priya Sharma',
            service: 'Painting - 2BHK',
            location: 'Bandra West',
            date: 'Today, 10:00 AM',
            status: 'pending',
        },
        {
            id: '2',
            customer: 'Amit Patel',
            service: 'Touch-up',
            location: 'Khar West',
            date: 'Yesterday',
            status: 'accepted',
        },
        {
            id: '3',
            customer: 'Rajesh Kumar',
            service: 'Full Home Painting',
            location: 'Andheri East',
            date: 'Oct 24',
            status: 'completed',
        },
    ];

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, Ramesh!</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                        <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Recent Requests */}
                <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">Recent Service Requests</h2>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentRequests.map((req) => (
                            <div key={req.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{req.customer}</h3>
                                    <p className="text-sm text-gray-600">{req.service} • {req.location}</p>
                                    <p className="text-xs text-gray-400 mt-1">{req.date}</p>
                                </div>
                                <div>
                                    {req.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700">Accept</button>
                                            <button className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm font-medium hover:bg-red-100">Decline</button>
                                        </div>
                                    )}
                                    {req.status === 'accepted' && (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Synced</span>
                                    )}
                                    {req.status === 'completed' && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Completed</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions / Status */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Availability Status</h3>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">Active for new jobs</span>
                            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 bg-green-500">
                                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">You are currently visible to builders and managers in <b>Mumbai, Bandra</b>.</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg shadow-md p-6 text-white">
                        <h3 className="font-bold text-lg mb-2">Grow your business</h3>
                        <p className="text-blue-100 text-sm mb-4">Complete more jobs and get 5-star ratings to unlock premium leads.</p>
                        <button className="w-full py-2 bg-white text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-50">View Tips</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
