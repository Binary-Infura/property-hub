'use client';

export default function PropertyPartnerDashboard() {
  // Mock analytics data - replace with actual API calls
  const analyticsData = {
    totalProperties: 12,
    activeProperties: 8,
    totalUnits: 840,
    bookedUnits: 547,
    totalRevenue: 4250000000,
    monthlyLeads: 156,
    conversionRate: 42.8,
    avgDaysToClose: 28,
  };

  const recentActivity = [
    { type: 'booking', message: 'New booking for Unit 1204, Block A - Sunset Towers', time: '2 hours ago' },
    { type: 'inquiry', message: 'New inquiry from Rajesh Kumar for 3BHK', time: '4 hours ago' },
    { type: 'visit', message: 'Site visit scheduled - Green Valley, Block B', time: '5 hours ago' },
    { type: 'approval', message: 'Property "Metro Heights" approved and published', time: '1 day ago' },
    { type: 'booking', message: 'Booking confirmed for Unit 503, City Square', time: '1 day ago' },
  ];

  const topProperties = [
    { name: 'Sunset Towers', location: 'Bandra, Mumbai', bookingRate: 78, units: 240 },
    { name: 'Green Valley', location: 'Powai, Mumbai', bookingRate: 70, units: 400 },
    { name: 'City Square', location: 'Andheri, Mumbai', bookingRate: 38, units: 120 },
  ];

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    }
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const bookingPercentage = Math.round((analyticsData.bookedUnits / analyticsData.totalUnits) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of your property portfolio</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Properties</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analyticsData.totalProperties}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              <span className="font-medium">{analyticsData.activeProperties}</span> active
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Units</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{analyticsData.totalUnits}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium text-green-600">{analyticsData.bookedUnits}</span> booked ({bookingPercentage}%)
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(analyticsData.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">From all bookings</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly Leads</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{analyticsData.monthlyLeads}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium text-green-600">{analyticsData.conversionRate}%</span> conversion rate
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Booking Progress */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Overall Booking Progress</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Units Booked</span>
                <span className="text-2xl font-bold text-gray-900">{analyticsData.bookedUnits} / {analyticsData.totalUnits}</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                  style={{ width: `${bookingPercentage}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{analyticsData.bookedUnits}</p>
                  <p className="text-sm text-gray-600">Booked</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{analyticsData.totalUnits - analyticsData.bookedUnits}</p>
                  <p className="text-sm text-gray-600">Available</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{bookingPercentage}%</p>
                  <p className="text-sm text-gray-600">Booking Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Properties */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Top Performing Properties</h2>
            <div className="space-y-4">
              {topProperties.map((property, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-amber-600'
                      }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{property.name}</p>
                      <p className="text-sm text-gray-600">{property.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{property.bookingRate}%</p>
                    <p className="text-sm text-gray-500">{property.units} units</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Stats */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === 'booking' ? 'bg-green-100' :
                    activity.type === 'inquiry' ? 'bg-blue-100' :
                      activity.type === 'visit' ? 'bg-purple-100' :
                        'bg-amber-100'
                    }`}>
                    {activity.type === 'booking' && (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {activity.type === 'inquiry' && (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    )}
                    {activity.type === 'visit' && (
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    {activity.type === 'approval' && (
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900">{activity.message}</p>
                    <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">Avg. Days to Close</p>
                <p className="text-2xl font-bold text-blue-900">{analyticsData.avgDaysToClose} days</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <p className="text-sm text-green-700 font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold text-green-900">{analyticsData.conversionRate}%</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <p className="text-sm text-purple-700 font-medium">Active Properties</p>
                <p className="text-2xl font-bold text-purple-900">{analyticsData.activeProperties}</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                <p className="text-sm text-orange-700 font-medium">This Month&apos;s Leads</p>
                <p className="text-2xl font-bold text-orange-900">{analyticsData.monthlyLeads}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
