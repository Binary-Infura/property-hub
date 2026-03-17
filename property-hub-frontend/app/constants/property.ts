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
  published: { label: 'Published', color: 'text-purple-600', bgColor: 'bg-purple-50', ringColor: 'ring-purple-200' },
  available: { label: 'Available', color: 'text-emerald-600', bgColor: 'bg-emerald-50', ringColor: 'ring-emerald-200' },
  sold: { label: 'Sold', color: 'text-gray-600', bgColor: 'bg-gray-50', ringColor: 'ring-gray-200' },
  reserved: { label: 'Reserved', color: 'text-orange-600', bgColor: 'bg-orange-50', ringColor: 'ring-orange-200' },
};

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const AMENITIES_OPTIONS = [
  'Swimming Pool',
  'Gym',
  'Playground',
  'Community Center',
  'Garden',
  'Security',
  '24/7 Power Backup',
  'Water Treatment',
  'Parking',
  'Lift',
  'Intercom',
  'CCTV',
];
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
