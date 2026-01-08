'use client';

import { use, useState } from 'react';
import { Block } from '@/app/types/block';
import TabNavigation from '@/app/components/blocks/TabNavigation';
import { STATUS_CONFIG, DEMAND_LEVEL_CONFIG } from '@/app/constants/block';
import { calculateBookingPercentage, calculateDemandLevel, formatPriceWithCommas } from '@/app/utils/blockPricing';

// Mock data - replace with actual API call based on blockId
const MOCK_BLOCK: Block = {
  id: 'block-001',
  projectId: 'project-001',
  buildingId: 'building-001',
  name: 'Block A',
  code: 'BLK-A',
  type: 'residential',
  status: 'active',
  possessionDate: new Date('2024-12-31'),
  totalFloors: 20,
  unitsPerFloor: 4,
  totalUnits: 80,
  liftCount: 2,
  fireExitCount: 2,
  basePricePerSqft: 5000,
  floorRisePricePerFloor: 50000,
  unitTypePricing: [
    { type: '2BHK', basePrice: 5000, units: 40 },
    { type: '3BHK', basePrice: 5500, units: 40 },
  ],
  offers: { enabled: false, description: '' },
  showOnPortal: true,
  allowChannelPartners: true,
  allowConsultants: true,
  eligibleForBoostCampaigns: true,
  floors: [],
  totalAvailableUnits: 30,
  totalBookedUnits: 50,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  createdBy: 'builder@example.com',
  publishedAt: new Date('2024-01-20'),
};

interface BlockDetailPageProps {
  params: {
    projectId: string;
    buildingId: string;
    blockId: string;
  };
}

export default function BlockDetailPage({ params }: BlockDetailPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [block] = useState<Block>(MOCK_BLOCK);

  const bookingPercentage = calculateBookingPercentage(block.totalBookedUnits, block.totalUnits);
  const demandLevel = calculateDemandLevel(bookingPercentage);
  const statusConfig = STATUS_CONFIG[block.status];
  const demandConfig = DEMAND_LEVEL_CONFIG[demandLevel];

  const averageUnitPrice = (block.basePricePerSqft * 1200); // Assuming 1200 sqft average

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
              <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
              PropertyHub
            </div>
            <div className="flex items-center gap-6">
              <a href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <a href="/builder/dashboard" className="hover:text-gray-900">
                  Dashboard
                </a>
                <span>→</span>
                <a href={`/builder/dashboard/projects/${params.projectId}`} className="hover:text-gray-900">
                  Projects
                </a>
                <span>→</span>
                <a href={`/builder/dashboard/projects/${params.projectId}/buildings/${params.buildingId}`} className="hover:text-gray-900">
                  Buildings
                </a>
                <span>→</span>
                <a href={`/builder/dashboard/projects/${params.projectId}/buildings/${params.buildingId}/blocks`} className="hover:text-gray-900">
                  Blocks
                </a>
                <span>→</span>
                <span className="text-gray-900 font-medium">{block.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{block.name}</h1>
                  <p className="text-gray-600 mt-1 font-mono">{block.code}</p>
                </div>
                <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Total Units</p>
              <p className="text-2xl font-bold text-blue-900">{block.totalUnits}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Available</p>
              <p className="text-2xl font-bold text-green-900">{block.totalAvailableUnits}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-1">Booked</p>
              <p className="text-2xl font-bold text-orange-900">{block.totalBookedUnits}</p>
            </div>
            <div className={`bg-gradient-to-br ${demandConfig.bgColor} rounded-lg p-4 border ${demandConfig.color}`}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1">Demand</p>
              <p className="text-2xl font-bold capitalize">{demandLevel}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">Booking %</p>
              <p className="text-2xl font-bold text-purple-900">{bookingPercentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Inventory Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Inventory Summary</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                    Booking Progress
                  </p>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">Booked Units</span>
                        <span className="text-2xl font-bold text-orange-600">{block.totalBookedUnits}</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500"
                          style={{ width: `${bookingPercentage}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">Available Units</span>
                        <span className="text-2xl font-bold text-green-600">{block.totalAvailableUnits}</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${100 - bookingPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                    Structure Details
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Total Floors</span>
                      <span className="font-bold text-gray-900">{block.totalFloors}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Units per Floor</span>
                      <span className="font-bold text-gray-900">{block.unitsPerFloor}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Lifts</span>
                      <span className="font-bold text-gray-900">{block.liftCount}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Fire Exits</span>
                      <span className="font-bold text-gray-900">{block.fireExitCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue and Demand */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Generated</h3>
                <p className="text-4xl font-bold text-green-600 mb-2">
                  ₹{formatPriceWithCommas(block.totalBookedUnits * averageUnitPrice)}
                </p>
                <p className="text-sm text-gray-600">
                  {block.totalBookedUnits} units × ₹{formatPriceWithCommas(averageUnitPrice)} avg
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Demand Indicator</h3>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-24 h-24 rounded-full border-4 ${demandConfig.color} bg-white`}>
                    <span className={`text-3xl font-bold capitalize ${demandConfig.color}`}>
                      {demandLevel[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className={`text-lg font-semibold ${demandConfig.color} capitalize`}>
                      {demandLevel} Demand
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Based on {bookingPercentage}% booking rate
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Block Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Block Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Type</p>
                    <p className="text-lg font-medium text-gray-900 capitalize">{block.type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Possession Date
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(block.possessionDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Created</p>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(block.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  {block.publishedAt && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Published</p>
                      <p className="text-lg font-medium text-gray-900">
                        {new Date(block.publishedAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Portal Visibility</p>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${block.showOnPortal ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {block.showOnPortal ? 'Visible' : 'Hidden'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-in fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Floors & Units</h2>
            <div className="space-y-4">
              {Array.from({ length: block.totalFloors }).map((_, floor) => (
                <div
                  key={floor}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Floor {floor + 1}</h3>
                    <span className="text-sm text-gray-600">
                      4 units ({Math.floor(Math.random() * 4)} booked)
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: block.unitsPerFloor }).map((_, unit) => (
                      <div
                        key={unit}
                        className={`p-3 rounded text-center text-sm font-medium transition ${
                          Math.random() > 0.6
                            ? 'bg-orange-100 text-orange-800 border border-orange-300'
                            : 'bg-green-100 text-green-800 border border-green-300'
                        }`}
                      >
                        {floor * block.unitsPerFloor + unit + 1}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Pricing Configuration</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Base Pricing</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg">
                      <span className="text-gray-700">Base Price (₹/sq ft)</span>
                      <span className="font-bold text-blue-600">₹{formatPriceWithCommas(block.basePricePerSqft)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg">
                      <span className="text-gray-700">Floor-Rise Price (₹/floor)</span>
                      <span className="font-bold text-purple-600">
                        ₹{formatPriceWithCommas(block.floorRisePricePerFloor)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Unit Type Pricing</p>
                  <div className="space-y-2">
                    {block.unitTypePricing.map((pricing, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-900">{pricing.type}</span>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ₹{formatPriceWithCommas(pricing.basePrice)}/sq ft
                          </p>
                          <p className="text-xs text-gray-600">{pricing.units} units</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {block.offers.enabled && (
              <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-6">
                <h3 className="text-lg font-bold text-green-900 mb-3">Block Offers</h3>
                <p className="text-green-800">{block.offers.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Sales & Leads Tab */}
        {activeTab === 'sales-leads' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-in fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Sales & Leads</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-semibold uppercase mb-1">Total Inquiries</p>
                <p className="text-3xl font-bold text-blue-900">42</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-semibold uppercase mb-1">Site Visits Scheduled</p>
                <p className="text-3xl font-bold text-green-900">18</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-700 font-semibold uppercase mb-1">Conversion Rate</p>
                <p className="text-3xl font-bold text-orange-900">42.8%</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Recent Leads</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Lead Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Unit Interested</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Date</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Rajesh Kumar', unit: '3BHK on Floor 15', date: '2024-01-20', status: 'Interested' },
                      { name: 'Priya Singh', unit: '2BHK on Floor 8', date: '2024-01-19', status: 'Negotiating' },
                      { name: 'Amit Patel', unit: '3BHK on Floor 12', date: '2024-01-18', status: 'Booked' },
                    ].map((lead, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{lead.name}</td>
                        <td className="px-4 py-3 text-gray-600">{lead.unit}</td>
                        <td className="px-4 py-3 text-gray-600">{lead.date}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              lead.status === 'Booked'
                                ? 'bg-green-100 text-green-800'
                                : lead.status === 'Negotiating'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Visibility & Access</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">Show on Portal</p>
                    <p className="text-sm text-gray-600 mt-1">Make this block visible to buyers</p>
                  </div>
                  <div
                    className={`w-12 h-6 rounded-full transition ${
                      block.showOnPortal ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transition absolute top-1 ${
                        block.showOnPortal ? 'right-1' : 'left-1'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">Allow Channel Partners</p>
                    <p className="text-sm text-gray-600 mt-1">Enable sales through channel partners</p>
                  </div>
                  <div
                    className={`w-12 h-6 rounded-full transition ${
                      block.allowChannelPartners ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transition absolute top-1 ${
                        block.allowChannelPartners ? 'right-1' : 'left-1'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">Allow Consultants</p>
                    <p className="text-sm text-gray-600 mt-1">Allow consultants to recommend this block</p>
                  </div>
                  <div
                    className={`w-12 h-6 rounded-full transition ${
                      block.allowConsultants ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transition absolute top-1 ${
                        block.allowConsultants ? 'right-1' : 'left-1'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">Eligible for Boost Campaigns</p>
                    <p className="text-sm text-gray-600 mt-1">Allow paid promotional campaigns</p>
                  </div>
                  <div
                    className={`w-12 h-6 rounded-full transition ${
                      block.eligibleForBoostCampaigns ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transition absolute top-1 ${
                        block.eligibleForBoostCampaigns ? 'right-1' : 'left-1'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
