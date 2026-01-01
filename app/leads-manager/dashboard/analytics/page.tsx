'use client';

import { useState } from 'react';

interface SourceMetric {
  source: string;
  leadsGenerated: number;
  qualifiedLeads: number;
  costPerLead: number;
  conversionRate: number;
}

interface RegionalMetric {
  region: string;
  leadsReceived: number;
  leadsAssigned: number;
  avgQualityScore: number;
  conversionRate: number;
}

export default function LeadsAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Sample data for source metrics
  const sourceMetrics: SourceMetric[] = [
    {
      source: 'Google Ads',
      leadsGenerated: 124,
      qualifiedLeads: 98,
      costPerLead: 180,
      conversionRate: 79,
    },
    {
      source: 'Facebook Ads',
      leadsGenerated: 89,
      qualifiedLeads: 62,
      costPerLead: 220,
      conversionRate: 70,
    },
    {
      source: 'Organic Search',
      leadsGenerated: 56,
      qualifiedLeads: 52,
      costPerLead: 0,
      conversionRate: 93,
    },
    {
      source: 'Referral',
      leadsGenerated: 32,
      qualifiedLeads: 31,
      costPerLead: 0,
      conversionRate: 97,
    },
    {
      source: 'Website Direct',
      leadsGenerated: 45,
      qualifiedLeads: 34,
      costPerLead: 0,
      conversionRate: 76,
    },
  ];

  // Sample data for regional metrics
  const regionalMetrics: RegionalMetric[] = [
    {
      region: 'North',
      leadsReceived: 85,
      leadsAssigned: 72,
      avgQualityScore: 78,
      conversionRate: 85,
    },
    {
      region: 'South',
      leadsReceived: 72,
      leadsAssigned: 61,
      avgQualityScore: 82,
      conversionRate: 85,
    },
    {
      region: 'East',
      leadsReceived: 94,
      leadsAssigned: 78,
      avgQualityScore: 75,
      conversionRate: 83,
    },
    {
      region: 'West',
      leadsReceived: 68,
      leadsAssigned: 58,
      avgQualityScore: 80,
      conversionRate: 85,
    },
    {
      region: 'Central',
      leadsReceived: 51,
      leadsAssigned: 44,
      avgQualityScore: 79,
      conversionRate: 86,
    },
  ];

  const totalLeads = sourceMetrics.reduce((sum, s) => sum + s.leadsGenerated, 0);
  const totalQualified = sourceMetrics.reduce((sum, s) => sum + s.qualifiedLeads, 0);
  const avgConversionRate = Math.round(
    sourceMetrics.reduce((sum, s) => sum + s.conversionRate, 0) / sourceMetrics.length
  );
  const totalCost = sourceMetrics.reduce((sum, s) => sum + s.costPerLead * s.leadsGenerated, 0);
  const avgCostPerLead = Math.round(totalCost / totalLeads);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lead Analytics & Reports</h1>
              <p className="text-gray-600 mt-1">Performance metrics by source and region</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary KPIs */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Total Leads</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalLeads}</p>
            <p className="text-xs text-gray-500 mt-2">Generated</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Qualified Leads</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{totalQualified}</p>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((totalQualified / totalLeads) * 100)}% conversion
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Avg Conversion Rate</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{avgConversionRate}%</p>
            <p className="text-xs text-gray-500 mt-2">Across all sources</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Total Lead Cost</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">₹{totalCost.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">Paid channels</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Avg Cost Per Lead</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">₹{avgCostPerLead}</p>
            <p className="text-xs text-gray-500 mt-2">Weighted average</p>
          </div>
        </div>

        {/* Source Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Source Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">Source</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-900">Leads</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-900">Qualified</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-900">Cost/Lead</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-900">Conversion Rate</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-900">Performance</th>
                </tr>
              </thead>
              <tbody>
                {sourceMetrics.map((metric, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-4 text-gray-900 font-medium">{metric.source}</td>
                    <td className="text-right px-4 py-4 text-gray-900">{metric.leadsGenerated}</td>
                    <td className="text-right px-4 py-4 text-gray-900">{metric.qualifiedLeads}</td>
                    <td className="text-right px-4 py-4 text-gray-900">
                      {metric.costPerLead === 0 ? 'Free' : `₹${metric.costPerLead}`}
                    </td>
                    <td className="text-right px-4 py-4">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                        {metric.conversionRate}%
                      </span>
                    </td>
                    <td className="text-right px-4 py-4">
                      {metric.conversionRate >= 80 ? (
                        <span className="text-green-600 font-semibold">✓ Excellent</span>
                      ) : metric.conversionRate >= 70 ? (
                        <span className="text-yellow-600 font-semibold">⚠ Good</span>
                      ) : (
                        <span className="text-red-600 font-semibold">✗ Poor</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regional Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Regional Performance</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Leads Assignment Efficiency */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Assignment Efficiency</h3>
              <div className="space-y-4">
                {regionalMetrics.map((metric, idx) => (
                  <div key={idx} className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{metric.region} Region</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {metric.leadsAssigned} of {metric.leadsReceived} assigned
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {Math.round((metric.leadsAssigned / metric.leadsReceived) * 100)}%
                      </p>
                      <div className="w-24 h-2 bg-gray-200 rounded-full mt-2">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{
                            width: `${(metric.leadsAssigned / metric.leadsReceived) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Score by Region */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Average Quality Score</h3>
              <div className="space-y-4">
                {regionalMetrics.map((metric, idx) => (
                  <div key={idx} className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{metric.region} Region</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {metric.leadsReceived} leads received
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{metric.avgQualityScore}</p>
                      <p className="text-xs text-gray-600">out of 100</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Regional Table */}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">Region</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-900">Received</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-900">Assigned</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-900">Efficiency</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-900">Avg Quality</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-900">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {regionalMetrics.map((metric, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-4 text-gray-900 font-medium">{metric.region}</td>
                    <td className="text-right px-4 py-4 text-gray-900">{metric.leadsReceived}</td>
                    <td className="text-right px-4 py-4 text-gray-900">{metric.leadsAssigned}</td>
                    <td className="text-right px-4 py-4 text-gray-900 font-semibold">
                      {Math.round((metric.leadsAssigned / metric.leadsReceived) * 100)}%
                    </td>
                    <td className="text-right px-4 py-4">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                        {metric.avgQualityScore}%
                      </span>
                    </td>
                    <td className="text-right px-4 py-4">
                      <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
                        {metric.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Top Performing Source</h3>
            <p className="text-blue-800">
              <strong>Google Ads</strong> leads with 79% conversion rate and generates the highest quality leads.
              Consider increasing budget allocation here.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-900 mb-3">Improvement Opportunity</h3>
            <p className="text-yellow-800">
              <strong>Facebook Ads</strong> shows 70% conversion rate. Review ad targeting and messaging to improve
              lead quality and reduce CPL from ₹220.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-3">Best Regional Performance</h3>
            <p className="text-green-800">
              <strong>East Region</strong> has the highest lead volume (94 leads) and strong 83% conversion rate.
              Ensure regional teams are properly supported.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-purple-900 mb-3">Cost Optimization</h3>
            <p className="text-purple-800">
              <strong>Organic & Referral channels</strong> (0 cost) contribute 88 leads at 95%+ conversion.
              Leverage customer success for more referrals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
