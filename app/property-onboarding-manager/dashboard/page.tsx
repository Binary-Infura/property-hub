'use client';

export default function OnboardingManagerDashboard() {
    // Mock Stats
    const stats = [
        { label: 'Total Properties Onboarded', value: '15', change: '+2 this month', icon: '🏢', color: 'bg-blue-50 text-blue-600' },
        { label: 'Active Property Partners', value: '8', change: '+1 this month', icon: '🤝', color: 'bg-green-50 text-green-600' },
        { label: 'Pending Approvals', value: '3', change: 'Needs attention', icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
    ];

    const recentActivities = [
        { id: 1, action: 'New Property Onboarded', subject: 'Sunshine Towers', time: '2 hours ago', status: 'success' },
        { id: 2, action: 'Partner Added', subject: 'Suresh Real Estate', time: '5 hours ago', status: 'success' },
        { id: 3, action: 'Property Warning', subject: 'Green Valley Villa 4 - Doc missing', time: '1 day ago', status: 'warning' },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Welcome back, Ravi! 👋</h1>
                <p className="text-blue-100 text-lg">Here's what's happening in your region today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${stat.color} text-2xl`}>
                                {stat.icon}
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.change.includes('+') ? 'bg-green-100 text-green-700' :
                                stat.change.includes('attention') ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span>⚡</span> Quick Actions
                    </h2>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition group">
                            <span className="font-medium">Onboard New Property</span>
                            <span className="text-gray-400 group-hover:text-blue-600">→</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-green-50 hover:text-green-600 transition group">
                            <span className="font-medium">Add Property Partner</span>
                            <span className="text-gray-400 group-hover:text-green-600">→</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition group">
                            <span className="font-medium">View Reports</span>
                            <span className="text-gray-400 group-hover:text-purple-600">→</span>
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span>📋</span> Recent Activity
                    </h2>
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-green-500' :
                                        activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                        }`} />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                                        <p className="text-sm text-gray-600">{activity.subject}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 text-center text-sm text-blue-600 font-medium hover:text-blue-700">
                        View All Activity
                    </button>
                </div>
            </div>
        </div>
    );
}
