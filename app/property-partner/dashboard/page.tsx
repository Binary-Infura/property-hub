'use client';

export default function PropertyPartnerDashboard() {
    // Mock Stats
    const stats = [
        { label: 'Assigned Properties', value: '5', change: '+1 this week', icon: '🏢', color: 'bg-blue-50 text-blue-600' },
        { label: 'Active Leads', value: '24', change: '+5 today', icon: '👥', color: 'bg-green-50 text-green-600' },
        { label: 'Scheduled Visits', value: '8', change: 'Upcoming', icon: '📅', color: 'bg-yellow-50 text-yellow-600' },
        { label: 'Closures (YTD)', value: '12', change: 'Excellent', icon: '🏆', color: 'bg-purple-50 text-purple-600' },
    ];

    const assignedProperties = [
        { id: 1, title: 'Sunset Heights', location: 'Andheri West', price: '₹2.5 Cr', status: 'Active' },
        { id: 2, title: 'Marina Bay', location: 'Worli', price: '₹4.2 Cr', status: 'Active' },
        { id: 3, title: 'Green Meadows', location: 'Thane', price: '₹1.1 Cr', status: 'Pending' },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Welcome, Suresh Homes! 🤝</h1>
                <p className="text-orange-50 text-lg">Manage your assigned properties and track your performance.</p>
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
                                    stat.change.includes('Upcoming') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
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
                {/* Assigned Properties Preview */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span>🏢</span> Your Top Properties
                        </h2>
                        <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
                    </div>
                    <div className="space-y-4">
                        {assignedProperties.map((prop) => (
                            <div key={prop.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-blue-200 transition hover:shadow-sm">
                                <div>
                                    <h3 className="font-bold text-gray-900">{prop.title}</h3>
                                    <p className="text-sm text-gray-500">📍 {prop.location}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{prop.price}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${prop.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {prop.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notifications / Tasks */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span>📝</span> Tasks & Alerts
                    </h2>
                    <div className="space-y-3">
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                            <strong>Urgent:</strong> Doc verification pending for Sunset Heights unit 402.
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
                            <strong>Visit:</strong> Mr. Kapoor visiting Marina Bay at 4 PM.
                        </div>
                        <div className="p-3 bg-gray-50 text-gray-700 rounded-lg text-sm border border-gray-100">
                            <strong>Reminder:</strong> Update property availability status by EOD.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
