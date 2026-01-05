'use client';

interface PartnerMetrics {
  leadsSubmitted: number;
  leadsConverted: number;
  conversionRate: number;
  totalEarnings: number;
  monthlyEarnings: number;
  topProperty: string;
}

interface PerformanceMetricsProps {
  metrics: PartnerMetrics;
}

export default function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  const performanceLevel = metrics.conversionRate >= 15 ? 'Excellent' : metrics.conversionRate >= 10 ? 'Good' : 'Average';
  const performanceColor = metrics.conversionRate >= 15 ? 'text-green-600' : metrics.conversionRate >= 10 ? 'text-blue-600' : 'text-yellow-600';

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Overall Performance */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">Overall Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-600 text-sm">Conversion Rate</p>
                <p className={`font-bold text-lg ${performanceColor}`}>{metrics.conversionRate.toFixed(1)}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all"
                  style={{ width: `${Math.min(metrics.conversionRate * 10, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <p className="text-gray-600 text-sm mb-2">Performance Level</p>
              <p className={`text-xl font-bold ${performanceColor}`}>{performanceLevel}</p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-700 font-medium mb-3">Key Achievements</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> {metrics.leadsConverted} leads converted
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> ₹{(metrics.totalEarnings / 100000).toFixed(1)}L total earnings
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> {metrics.leadsSubmitted} quality leads submitted
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">Earnings Breakdown</h3>
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-purple-600 text-sm font-medium mb-1">Lifetime Earnings</p>
              <p className="text-3xl font-bold text-purple-700">₹{(metrics.totalEarnings / 100000).toFixed(1)}L</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-green-600 text-sm font-medium mb-1">This Month</p>
              <p className="text-3xl font-bold text-green-700">₹{(metrics.monthlyEarnings / 100000).toFixed(1)}L</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-600 text-sm font-medium mb-1">Average per Lead</p>
              <p className="text-2xl font-bold text-blue-700">
                ₹{(metrics.totalEarnings / metrics.leadsSubmitted / 100000).toFixed(2)}L
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 mb-6">Detailed Metrics</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Metric Cards */}
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-700 font-medium">Leads Submitted</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.leadsSubmitted}</p>
              </div>
              <p className="text-xs text-gray-500">Total leads you've submitted to the platform</p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-700 font-medium">Leads Converted</p>
                <p className="text-2xl font-bold text-green-600">{metrics.leadsConverted}</p>
              </div>
              <p className="text-xs text-gray-500">Leads that resulted in successful bookings</p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-700 font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.conversionRate.toFixed(1)}%</p>
              </div>
              <p className="text-xs text-gray-500">Percentage of leads converted to bookings</p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-700 font-medium">Total Earnings</p>
                <p className="text-2xl font-bold text-orange-600">₹{(metrics.totalEarnings / 100000).toFixed(1)}L</p>
              </div>
              <p className="text-xs text-gray-500">Cumulative commissions earned</p>
            </div>
          </div>

          {/* Performance Graph & Goals */}
          <div>
            <div className="mb-6">
              <p className="text-gray-700 font-medium mb-3">Performance vs Goals</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-600">Monthly Target: 10 Leads</span>
                    <span className="font-semibold text-gray-900">
                      {Math.floor((metrics.leadsSubmitted / 10) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all"
                      style={{ width: `${Math.min((metrics.leadsSubmitted / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-600">Conversion Target: 15%</span>
                    <span className="font-semibold text-gray-900">
                      {Math.floor((metrics.conversionRate / 15) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-600 h-full transition-all"
                      style={{ width: `${Math.min((metrics.conversionRate / 15) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-600">Earnings Target: ₹5L/month</span>
                    <span className="font-semibold text-gray-900">
                      {Math.floor((metrics.monthlyEarnings / 500000) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-orange-600 h-full transition-all"
                      style={{ width: `${Math.min((metrics.monthlyEarnings / 500000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900 font-medium text-sm mb-2">💡 Top Performing Property</p>
              <p className="text-blue-800 text-sm">{metrics.topProperty}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-bold text-yellow-900 mb-4">📈 Tips to Improve Performance</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="font-semibold text-yellow-900 mb-2">Increase Quality Score</p>
            <ul className="space-y-1 text-sm text-yellow-800">
              <li>✓ Verify phone numbers before submission</li>
              <li>✓ Collect complete information (email, budget)</li>
              <li>✓ Submit leads with clear buying intent</li>
              <li>✓ Avoid spam or duplicate leads</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-yellow-900 mb-2">Boost Conversions</p>
            <ul className="space-y-1 text-sm text-yellow-800">
              <li>✓ Follow up with leads after submission</li>
              <li>✓ Share relevant property recommendations</li>
              <li>✓ Coordinate site visits for interested buyers</li>
              <li>✓ Provide excellent customer support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
