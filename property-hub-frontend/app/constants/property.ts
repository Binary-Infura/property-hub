/**
 * Property Constants for Real Estate Management
 */

import { PropertyStatus, PropertyType } from '@/app/types/property';

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'mixed-use', label: 'Mixed-Use' },
];

export const PROPERTY_STATUS_CONFIG: Record<PropertyStatus, { label: string; color: string; bgColor: string; ringColor: string }> = {
  submitted: { label: 'Submitted', color: 'text-blue-600', bgColor: 'bg-blue-50', ringColor: 'ring-blue-200' },
  approved: { label: 'Approved', color: 'text-emerald-600', bgColor: 'bg-emerald-50', ringColor: 'ring-emerald-200' },
  rejected: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-50', ringColor: 'ring-red-200' },
  draft: { label: 'Draft', color: 'text-gray-600', bgColor: 'bg-gray-50', ringColor: 'ring-gray-200' },
  under_construction: { label: 'Under Construction', color: 'text-amber-600', bgColor: 'bg-amber-50', ringColor: 'ring-amber-200' },
};



export const RESIDENTIAL_UNIT_TYPES = [
  '1BHK',
  '2BHK',
  '3BHK',
  '4BHK',
  '5BHK',
  'Studio',
  'Penthouse',
  'Duplex',
  'Villa',
];

export const PLOT_UNIT_TYPES = [
  'Residential Plot',
  'Commercial Plot',
  'Industrial Plot',
  'Agricultural Plot',
];
