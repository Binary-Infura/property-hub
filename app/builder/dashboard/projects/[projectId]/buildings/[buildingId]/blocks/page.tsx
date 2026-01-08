'use client';

import { use, useState } from 'react';
import { Block } from '@/app/types/block';
import BlockTable from '@/app/components/blocks/BlockTable';
import BlockCard from '@/app/components/blocks/BlockCard';
import { STATUS_CONFIG } from '@/app/constants/block';

// Mock data - replace with actual API calls
const MOCK_PROJECT_NAME = 'Sunset Towers';
const MOCK_BUILDING_NAME = 'North Wing';
const MOCK_BUILDING_ID = 'building-001';
const MOCK_PROJECT_ID = 'project-001';

const MOCK_BLOCKS: Block[] = [
  {
    id: 'block-001',
    projectId: MOCK_PROJECT_ID,
    buildingId: MOCK_BUILDING_ID,
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
  },
  {
    id: 'block-002',
    projectId: MOCK_PROJECT_ID,
    buildingId: MOCK_BUILDING_ID,
    name: 'Block B',
    code: 'BLK-B',
    type: 'residential',
    status: 'pre-launch',
    possessionDate: new Date('2025-06-30'),
    totalFloors: 18,
    unitsPerFloor: 4,
    totalUnits: 72,
    liftCount: 2,
    fireExitCount: 2,
    basePricePerSqft: 4800,
    floorRisePricePerFloor: 45000,
    unitTypePricing: [
      { type: '2BHK', basePrice: 4800, units: 36 },
      { type: '3BHK', basePrice: 5300, units: 36 },
    ],
    offers: { enabled: true, description: '15% early bird discount' },
    showOnPortal: true,
    allowChannelPartners: false,
    allowConsultants: true,
    eligibleForBoostCampaigns: false,
    floors: [],
    totalAvailableUnits: 72,
    totalBookedUnits: 0,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    createdBy: 'builder@example.com',
  },
  {
    id: 'block-003',
    projectId: MOCK_PROJECT_ID,
    buildingId: MOCK_BUILDING_ID,
    name: 'Block C',
    code: 'BLK-C',
    type: 'commercial',
    status: 'sold-out',
    possessionDate: new Date('2023-09-15'),
    totalFloors: 12,
    unitsPerFloor: 6,
    totalUnits: 72,
    liftCount: 3,
    fireExitCount: 2,
    basePricePerSqft: 6500,
    floorRisePricePerFloor: 75000,
    unitTypePricing: [
      { type: 'Commercial', basePrice: 6500, units: 72 },
    ],
    offers: { enabled: false, description: '' },
    showOnPortal: false,
    allowChannelPartners: true,
    allowConsultants: false,
    eligibleForBoostCampaigns: false,
    floors: [],
    totalAvailableUnits: 0,
    totalBookedUnits: 72,
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-09-01'),
    createdBy: 'builder@example.com',
    publishedAt: new Date('2023-06-10'),
  },
];

interface BlocksPageProps {
  params: {
    projectId: string;
    buildingId: string;
  };
}

export default function BlocksPage({ params }: BlocksPageProps) {
  const [blocks, setBlocks] = useState<Block[]>(MOCK_BLOCKS);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredBlocks = selectedStatus
    ? blocks.filter(block => block.status === selectedStatus)
    : blocks;

  const handleView = (blockId: string) => {
    // Navigate to block detail page
    console.log('View block:', blockId);
  };

  const handleEdit = (blockId: string) => {
    // Open edit form or navigate to edit page
    console.log('Edit block:', blockId);
  };

  const handleManageInventory = (blockId: string) => {
    // Open inventory management modal
    console.log('Manage inventory:', blockId);
  };

  const handleToggleVisibility = (blockId: string, currentState: boolean) => {
    // Toggle visibility on portal
    setBlocks(prev =>
      prev.map(block =>
        block.id === blockId ? { ...block, showOnPortal: !currentState } : block,
      ),
    );
    console.log('Toggle visibility:', blockId, !currentState);
  };

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
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <a href="/builder/dashboard" className="hover:text-gray-900">
                  Builder Dashboard
                </a>
                <span>→</span>
                <a href={`/builder/dashboard/projects/${params.projectId}`} className="hover:text-gray-900">
                  {MOCK_PROJECT_NAME}
                </a>
                <span>→</span>
                <a href={`/builder/dashboard/projects/${params.projectId}/buildings/${params.buildingId}`} className="hover:text-gray-900">
                  {MOCK_BUILDING_NAME}
                </a>
                <span>→</span>
                <span className="text-gray-900 font-medium">Blocks</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Blocks</h1>
              <p className="text-gray-600 mt-1">{MOCK_PROJECT_NAME} • {MOCK_BUILDING_NAME}</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Block
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <button
                onClick={() => setSelectedStatus(null)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  selectedStatus === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                All ({blocks.length})
              </button>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                const count = blocks.filter(b => b.status === status).length;
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      selectedStatus === status
                        ? config.color
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {config.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                title="Table view"
                className={`p-2 rounded transition ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                title="Card view"
                className={`p-2 rounded transition ${
                  viewMode === 'cards'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 4H5a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V6a2 2 0 00-2-2zm0 0h4a2 2 0 012 2v4a2 2 0 01-2 2H9m0-12v0m0 6H5a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2v-4a2 2 0 00-2-2m0 0v0m6-6h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V6a2 2 0 012-2zm0 0v0m0 6h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4a2 2 0 012-2"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Total Blocks</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{blocks.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Active</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {blocks.filter(b => b.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Pre-Launch</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {blocks.filter(b => b.status === 'pre-launch').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Total Units</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {blocks.reduce((sum, block) => sum + block.totalUnits, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Avg. Booking</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {filteredBlocks.length > 0
                ? Math.round(
                    (filteredBlocks.reduce((sum, b) => sum + b.totalBookedUnits, 0) /
                      filteredBlocks.reduce((sum, b) => sum + b.totalUnits, 0)) *
                      100,
                  )
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Blocks Display */}
        {filteredBlocks.length > 0 ? (
          viewMode === 'table' ? (
            <BlockTable
              blocks={filteredBlocks}
              onView={handleView}
              onEdit={handleEdit}
              onManageInventory={handleManageInventory}
              onToggleVisibility={handleToggleVisibility}
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlocks.map(block => (
                <BlockCard
                  key={block.id}
                  block={block}
                  onView={handleView}
                  onEdit={handleEdit}
                  onManageInventory={handleManageInventory}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 text-center py-12">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 21l-4.35-4.35m0 0A7.5 7.5 0 103.305 3.305a7.5 7.5 0 0010.345 10.345z"
              />
            </svg>
            <p className="text-gray-600 font-medium mb-1">No blocks found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
