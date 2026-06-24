'use client';

import { Block } from '@/app/types/block';
import { STATUS_CONFIG, ACTION_TOOLTIPS } from '@/app/constants/block';
import { calculateBookingPercentage } from '@/app/utils/blockPricing';
import { formatPriceWithCommas } from '@/app/utils/blockValidation';

interface BlockCardProps {
  block: Block;
  onView: (blockId: string) => void;
  onEdit: (blockId: string) => void;
  onManageInventory: (blockId: string) => void;
  onToggleVisibility: (blockId: string, currentState: boolean) => void;
}

export default function BlockCard({
  block,
  onView,
  onEdit,
  onManageInventory,
  onToggleVisibility,
}: BlockCardProps) {
  const bookingPercentage = calculateBookingPercentage(
    block.totalBookedUnits,
    block.totalUnits,
  );
  const statusConfig = STATUS_CONFIG[block.status];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-300 transition-all overflow-hidden ${statusConfig.bgLight}`}>
      {/* Header with Status Badge */}
      <div className={`px-6 py-4 border-b border-gray-200 flex items-start justify-between bg-gradient-to-r from-gray-50 to-transparent`}>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{block.name}</h3>
          <p className="text-sm text-gray-600 mt-1 font-mono">{block.code}</p>
        </div>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      {/* Main Content */}
      <div className="px-6 py-5 space-y-5">
        {/* Block Type and Possession */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Type</p>
            <p className="text-sm font-medium text-gray-900 capitalize">{block.type}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Possession</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(block.possessionDate).toLocaleDateString('en-IN', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Structure Overview */}
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Structure</p>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{block.totalFloors}</p>
              <p className="text-xs text-gray-600 mt-1">Floors</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{block.totalUnits}</p>
              <p className="text-xs text-gray-600 mt-1">Units</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{block.liftCount}</p>
              <p className="text-xs text-gray-600 mt-1">Lifts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{block.fireExitCount}</p>
              <p className="text-xs text-gray-600 mt-1">Exits</p>
            </div>
          </div>
        </div>

        {/* Booking Status */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Booking Status</p>
            <span className="text-sm font-bold text-gray-900">
              {block.totalBookedUnits}/{block.totalUnits} ({bookingPercentage}%)
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${bookingPercentage >= 80
                  ? 'bg-red-500'
                  : bookingPercentage >= 50
                    ? 'bg-amber-500'
                    : 'bg-green-500'
                }`}
              style={{ width: `${bookingPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            <span className="font-semibold text-green-600">{block.totalUnits - block.totalBookedUnits}</span> available
          </p>
        </div>

        {/* Pricing */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Base Price</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-blue-600">₹{formatPriceWithCommas(block.basePricePerSqft)}</p>
            <p className="text-sm text-blue-700">/sq ft</p>
          </div>
          {block.floorRisePricePerFloor > 0 && (
            <p className="text-xs text-blue-600 mt-2">
              +₹{formatPriceWithCommas(block.floorRisePricePerFloor)} per floor
            </p>
          )}
        </div>

        {/* Visibility Indicators */}
        <div className="flex items-center gap-3 text-xs">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${block.showOnPortal ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              {block.showOnPortal ? (
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              ) : (
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
              )}
            </svg>
            <span className="text-xs font-medium">{block.showOnPortal ? 'On Portal' : 'Hidden'}</span>
          </div>
          {block.allowChannelPartners && (
            <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center gap-1">
              <span className="text-xs font-medium">Partners</span>
            </div>
          )}
          {block.allowConsultants && (
            <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full flex items-center gap-1">
              <span className="text-xs font-medium">Consultants</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={() => onView(block.id)}
          className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
        >
          View Details →
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(block.id)}
            title={ACTION_TOOLTIPS.edit}
            className="p-2 hover:bg-amber-100 rounded-lg text-amber-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onManageInventory(block.id)}
            title={ACTION_TOOLTIPS.inventory}
            className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10M8 7v10m8-10v10"
              />
            </svg>
          </button>
          <button
            onClick={() => onToggleVisibility(block.id, block.showOnPortal)}
            title={ACTION_TOOLTIPS.visibility}
            className={`p-2 rounded-lg transition-colors ${block.showOnPortal
                ? 'hover:bg-purple-100 text-purple-600'
                : 'hover:bg-gray-200 text-gray-400'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
