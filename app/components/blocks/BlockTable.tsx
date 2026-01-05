'use client';

import { useState } from 'react';
import { Block } from '@/app/types/block';
import { STATUS_CONFIG, ACTION_TOOLTIPS } from '@/app/constants/block';
import { calculateBookingPercentage, formatPriceWithCommas } from '@/app/utils/blockPricing';

interface BlockTableProps {
  blocks: Block[];
  onView: (blockId: string) => void;
  onEdit: (blockId: string) => void;
  onManageInventory: (blockId: string) => void;
  onToggleVisibility: (blockId: string, currentState: boolean) => void;
}

export default function BlockTable({
  blocks,
  onView,
  onEdit,
  onManageInventory,
  onToggleVisibility,
}: BlockTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  if (blocks.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
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
        <p className="text-gray-500 text-sm">Start by adding your first block</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full">
        {/* Table Header */}
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Block Name</th>
            <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Block Code</th>
            <th className="text-center px-6 py-4 font-semibold text-gray-900 text-sm">Floors</th>
            <th className="text-center px-6 py-4 font-semibold text-gray-900 text-sm">Units</th>
            <th className="text-center px-6 py-4 font-semibold text-gray-900 text-sm">Booked</th>
            <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Status</th>
            <th className="text-right px-6 py-4 font-semibold text-gray-900 text-sm">Base Price</th>
            <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Possession</th>
            <th className="text-center px-6 py-4 font-semibold text-gray-900 text-sm">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {blocks.map((block) => {
            const bookingPercentage = calculateBookingPercentage(
              block.totalBookedUnits,
              block.totalUnits,
            );
            const statusConfig = STATUS_CONFIG[block.status];
            const isHovered = hoveredRowId === block.id;

            return (
              <tr
                key={block.id}
                onMouseEnter={() => setHoveredRowId(block.id)}
                onMouseLeave={() => setHoveredRowId(null)}
                className={`border-b border-gray-200 transition-colors ${
                  isHovered ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                {/* Block Name */}
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{block.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{block.type}</p>
                  </div>
                </td>

                {/* Block Code */}
                <td className="px-6 py-4">
                  <span className="inline-block bg-gray-100 text-gray-900 px-3 py-1 rounded font-mono text-sm">
                    {block.code}
                  </span>
                </td>

                {/* Total Floors */}
                <td className="px-6 py-4 text-center">
                  <span className="font-semibold text-gray-900">{block.totalFloors}</span>
                </td>

                {/* Total Units */}
                <td className="px-6 py-4 text-center">
                  <span className="font-semibold text-gray-900">{block.totalUnits}</span>
                </td>

                {/* Booked / Available Units with Progress Bar */}
                <td className="px-6 py-4">
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {block.totalBookedUnits}/{block.totalUnits}
                      </span>
                    </div>
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                      <div
                        className={`h-full transition-all ${
                          bookingPercentage >= 80
                            ? 'bg-red-500'
                            : bookingPercentage >= 50
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${bookingPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-1">{bookingPercentage}%</p>
                  </div>
                </td>

                {/* Launch Status Badge */}
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </td>

                {/* Base Price */}
                <td className="px-6 py-4 text-right">
                  <div>
                    <p className="font-semibold text-gray-900">₹{formatPriceWithCommas(block.basePricePerSqft)}</p>
                    <p className="text-xs text-gray-500">/sq ft</p>
                  </div>
                </td>

                {/* Possession Date */}
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">
                    {new Date(block.possessionDate).toLocaleDateString('en-IN', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {/* View */}
                    <button
                      onClick={() => onView(block.id)}
                      title={ACTION_TOOLTIPS.view}
                      className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
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

                    {/* Edit */}
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

                    {/* Manage Inventory */}
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

                    {/* Visibility Toggle */}
                    <button
                      onClick={() => onToggleVisibility(block.id, block.showOnPortal)}
                      title={ACTION_TOOLTIPS.visibility}
                      className={`p-2 rounded-lg transition-colors ${
                        block.showOnPortal
                          ? 'hover:bg-purple-100 text-purple-600'
                          : 'hover:bg-gray-200 text-gray-400'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            block.showOnPortal
                              ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                              : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-2.29m5.159-2.674A9.01 9.01 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.969 9.969 0 01-1.564 2.294M15 12a3 3 0 11-6 0 3 3 0 016 0z M9.879 7.519c1.171-1.025 2.75-1.604 4.404-1.604a5 5 0 015 5 5 5 0 01-.823 2.592m-4.088 4.088a1 1 0 1.414-1.414M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                            }
                          }
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}