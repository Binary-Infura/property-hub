/**
 * Property Constants for Real Estate Management
 */

import { PropertyStatus, PropertyType } from '@/app/types/property';

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'mixed-use', label: 'Mixed-Use' },
];

export const PROPERTY_STATUS_CONFIG: Record<PropertyStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Draft', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  submitted: { label: 'Submitted', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  approved: { label: 'Approved', color: 'text-green-600', bgColor: 'bg-green-100' },
  rejected: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100' },
  published: { label: 'Published', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  available: { label: 'Available', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  sold: { label: 'Sold', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  reserved: { label: 'Reserved', color: 'text-orange-600', bgColor: 'bg-orange-100' },
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
