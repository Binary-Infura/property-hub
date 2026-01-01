'use client';

import { useState } from 'react';
import { Lead } from '@/app/types/lead';

const REGIONS = ['North', 'South', 'East', 'West', 'Central'];

interface RegionalData {
  region: string;
  assignedLeads: number;
  pendingLeads: number;
  avgQualityScore: number;
}

export default function RegionalAssignmentPage() {
  // Use fixed reference date to avoid hydration mismatches
  const REFERENCE_DATE = new Date('2024-12-29T10:00:00Z');

  const [leads] = useState<Lead[]>([
    {
      id: '1',
      name: 'Rajesh Kumar',
      phone: '9876543210',
      email: 'rajesh@example.com',
      location: 'Bandra, Mumbai',
      city: 'Mumbai',
      budget: '₹75L - ₹1Cr',
      propertyType: '3 BHK',
      buyerIntent: 'end-use',
      source: 'Google Ads',
      status: 'qualified',
      qualityScore: 85,
      createdAt: new Date(REFERENCE_DATE.getTime() - 2 * 24 * 60 * 60 * 1000),
      tags: ['High Budget', 'Verified Phone'],
    },
    {
      id: '2',
      name: 'Priya Singh',
      phone: '9123456789',
      email: 'priya@example.com',
      location: 'Powai, Mumbai',
      city: 'Mumbai',
      budget: '₹50L - ₹75L',
      propertyType: '2 BHK',
      buyerIntent: 'investment',
      source: 'Facebook Ads',
      status: 'pending-review',
      qualityScore: 65,
      createdAt: new Date(REFERENCE_DATE.getTime() - 5 * 24 * 60 * 60 * 1000),
      tags: ['Young Professional'],
    },
    {
      id: '3',
      name: 'Amit Patel',
      phone: '9098765432',
      location: 'Andheri, Mumbai',
      city: 'Mumbai',
      budget: '₹40L - ₹60L',
      propertyType: '2 BHK',
      buyerIntent: 'end-use',
      source: 'Organic Search',
      status: 'qualified',
      qualityScore: 78,
      createdAt: new Date(REFERENCE_DATE.getTime() - 1 * 24 * 60 * 60 * 1000),
      region: 'West',
      assignedTo: {
        region: 'West',
        assignedAt: new Date(REFERENCE_DATE.getTime() - 12 * 60 * 60 * 1000),
      },
    },
    {
      id: '5',
      name: 'Neha Gupta',
      phone: '9765432109',
      email: 'neha@example.com',
      location: 'Pune',
      city: 'Pune',
      budget: '₹30L - ₹50L',
      propertyType: '2 BHK',
      buyerIntent: 'end-use',
      source: 'Referral',
      status: 'qualified',
      qualityScore: 88,
      createdAt: new Date(REFERENCE_DATE.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: '6',
      name: 'Vikram Desai',
      phone: '8765432109',
      email: 'vikram@example.com',
      location: 'Chembur, Mumbai',
      city: 'Mumbai',
      budget: '₹60L - ₹85L',
      propertyType: '2 BHK',
      buyerIntent: 'investment',
      source: 'Google Ads',
      status: 'qualified',
      qualityScore: 82,
      createdAt: new Date(REFERENCE_DATE.getTime() - 4 * 24 * 60 * 60 * 1000),
      tags: ['Investor', 'Flexible'],
    },
  ]);

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Calculate regional metrics
  const calculateRegionalMetrics = (): Record<string, RegionalData> => {
    const metrics: Record<string, RegionalData> = {};

    REGIONS.forEach((region) => {
      const assignedLeads = leads.filter((l) => l.region === region).length;
      const pendingLeads = leads.filter(
        (l) => l.status === 'qualified' && !l.assignedTo && l.city && isInRegion(l.city, region)
      ).length;
      const allRegionalLeads = leads.filter((l) => l.region === region);
      const avgQualityScore =
        allRegionalLeads.length > 0
          ? Math.round(allRegionalLeads.reduce((sum, l) => sum + l.qualityScore, 0) / allRegionalLeads.length)
          : 0;

      metrics[region] = {
        region,
        assignedLeads,
        pendingLeads,
        avgQualityScore,
      };
    });

    return metrics;
  };

  const isInRegion = (city: string, region: string): boolean => {
    const regionMap: Record<string, string[]> = {
      North: ['Delhi', 'Gurgaon', 'Noida', 'Chandigarh'],
      South: ['Bangalore', 'Hyderabad', 'Chennai', 'Pune'],
      East: ['Kolkata', 'Bhubaneswar', 'Patna'],
      West: ['Mumbai', 'Pune', 'Ahmedabad', 'Surat'],
      Central: ['Nagpur', 'Indore', 'Bhopal'],
    };
    return regionMap[region]?.includes(city) || false;
  };

  const metrics = calculateRegionalMetrics();
  const selectedRegionData = selectedRegion ? metrics[selectedRegion] : null;
  const qualifiedLeadsForRegion = selectedRegion
    ? leads.filter((l) => l.status === 'qualified' && !l.assignedTo && isInRegion(l.city || '', selectedRegion))
    : [];

  const totalAssigned = Object.values(metrics).reduce((sum, m) => sum + m.assignedLeads, 0);
  const totalQualified = leads.filter((l) => l.status === 'qualified').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Regional Lead Allocation</h1>
          <p className="text-gray-600 mt-1">Assign qualified leads to regional teams</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Total Qualified Leads</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{totalQualified}</p>
            <p className="text-xs text-gray-500 mt-2">Ready for allocation</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Assigned Leads</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{totalAssigned}</p>
            <p className="text-xs text-gray-500 mt-2">
              {totalQualified > 0 ? Math.round((totalAssigned / totalQualified) * 100) : 0}% of qualified
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Pending Allocation</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{totalQualified - totalAssigned}</p>
            <p className="text-xs text-gray-500 mt-2">Not yet assigned</p>
          </div>
        </div>

        {/* Regional Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {REGIONS.map((region) => {
            const metric = metrics[region];
            return (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`p-6 rounded-lg border-2 transition text-left ${
                  selectedRegion === region
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <h3 className={`text-lg font-bold ${selectedRegion === region ? 'text-blue-900' : 'text-gray-900'}`}>
                  {region}
                </h3>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Assigned</span>
                    <span className="text-2xl font-bold text-green-600">{metric.assignedLeads}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Pending</span>
                    <span className="text-xl font-bold text-yellow-600">{metric.pendingLeads}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-600 font-medium">Avg Quality</span>
                    <p className="text-lg font-bold text-blue-600 mt-1">{metric.avgQualityScore}%</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Regional Details Panel */}
        {selectedRegionData ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 lg:col-span-1">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{selectedRegion} Region Summary</h2>

              <div className="space-y-6">
                {/* Stats */}
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-700 font-medium">Currently Assigned</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{selectedRegionData.assignedLeads}</p>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-700 font-medium">Pending for This Region</p>
                    <p className="text-3xl font-bold text-yellow-900 mt-2">{qualifiedLeadsForRegion.length}</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-700 font-medium">Avg Quality Score</p>
                    <p className="text-3xl font-bold text-purple-900 mt-2">{selectedRegionData.avgQualityScore}%</p>
                  </div>
                </div>

                {/* Regional Info */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 font-medium mb-2">COVERAGE AREA</p>
                  <div className="space-y-1">
                    {selectedRegion === 'North' && (
                      <>
                        <p className="text-sm text-gray-900">Delhi, Gurgaon</p>
                        <p className="text-sm text-gray-900">Noida, Chandigarh</p>
                      </>
                    )}
                    {selectedRegion === 'South' && (
                      <>
                        <p className="text-sm text-gray-900">Bangalore, Hyderabad</p>
                        <p className="text-sm text-gray-900">Chennai, Pune</p>
                      </>
                    )}
                    {selectedRegion === 'East' && (
                      <>
                        <p className="text-sm text-gray-900">Kolkata, Bhubaneswar</p>
                        <p className="text-sm text-gray-900">Patna</p>
                      </>
                    )}
                    {selectedRegion === 'West' && (
                      <>
                        <p className="text-sm text-gray-900">Mumbai, Pune</p>
                        <p className="text-sm text-gray-900">Ahmedabad, Surat</p>
                      </>
                    )}
                    {selectedRegion === 'Central' && (
                      <>
                        <p className="text-sm text-gray-900">Nagpur, Indore</p>
                        <p className="text-sm text-gray-900">Bhopal</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Leads for Assignment */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 lg:col-span-2">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Qualified Leads for {selectedRegion} ({qualifiedLeadsForRegion.length})
              </h3>

              {qualifiedLeadsForRegion.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-600 font-medium">No pending leads for this region</p>
                  <p className="text-gray-500 text-sm mt-2">All qualified leads have been assigned</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {qualifiedLeadsForRegion.map((lead) => (
                    <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{lead.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{lead.phone}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          {lead.qualityScore}% Quality
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-gray-600 font-medium">Location</p>
                          <p className="text-gray-900">{lead.location}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">Budget</p>
                          <p className="text-gray-900">{lead.budget}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">Intent</p>
                          <p className="text-gray-900 capitalize">{lead.buyerIntent}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition">
                          Assign to {selectedRegion}
                        </button>
                        <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded font-medium text-sm hover:bg-gray-200 transition">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 20l-5.447-2.724A1 1 0 003 16.382V5.618a1 1 0 011.553-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.553-.894L15 11"
              />
            </svg>
            <p className="text-gray-600 font-medium">Select a region to view and assign leads</p>
          </div>
        )}

        {/* Assignment Guidelines */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">✓ Assignment Rules</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Only assign qualified leads (quality score ≥ 60%)</li>
              <li>• Match leads by location/city with regional coverage</li>
              <li>• Assignments are permanent and cannot be changed</li>
              <li>• Bulk assign to regions for efficiency</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-900 mb-3">⚠ Important Notes</h3>
            <ul className="text-sm text-yellow-800 space-y-2">
              <li>• Ensure lead quality before assignment</li>
              <li>• Regional assignment cannot be undone</li>
              <li>• Consultants receive assignment notifications</li>
              <li>• Track regional performance regularly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
