/**
 * Block Constants for Real Estate Management
 * Includes status definitions, types, and UI configurations
 */

export const BLOCK_STATUSES = {
  DRAFT: 'draft',
  PRE_LAUNCH: 'pre-launch',
  ACTIVE: 'active',
  HOLD: 'hold',
  SOLD_OUT: 'sold-out',
} as const;

export const BLOCK_TYPES = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
} as const;

export const DEMAND_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// Status badge styling and labels
export const STATUS_CONFIG = {
  'draft': {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    bgLight: 'bg-gray-50',
    borderColor: 'border-gray-300',
    badgeColor: 'bg-gray-200 text-gray-700',
  },
  'pre-launch': {
    label: 'Pre-Launch',
    color: 'bg-purple-100 text-purple-800',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-300',
    badgeColor: 'bg-purple-200 text-purple-700',
  },
  'active': {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    bgLight: 'bg-green-50',
    borderColor: 'border-green-300',
    badgeColor: 'bg-green-200 text-green-700',
  },
  'hold': {
    label: 'Hold',
    color: 'bg-yellow-100 text-yellow-800',
    bgLight: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    badgeColor: 'bg-yellow-200 text-yellow-700',
  },
  'sold-out': {
    label: 'Sold Out',
    color: 'bg-red-100 text-red-800',
    bgLight: 'bg-red-50',
    borderColor: 'border-red-300',
    badgeColor: 'bg-red-200 text-red-700',
  },
} as const;

export const BLOCK_TYPE_LABELS = {
  'residential': 'Residential',
  'commercial': 'Commercial',
} as const;

export const DEMAND_LEVEL_CONFIG = {
  'low': {
    label: 'Low',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  'medium': {
    label: 'Medium',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  'high': {
    label: 'High',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
} as const;

// Common unit types
export const UNIT_TYPES = [
  '1BHK',
  '2BHK',
  '3BHK',
  '4BHK',
  '4+ BHK',
  'Studio',
  'Penthouse',
] as const;

// Add Block form step configuration
export const ADD_BLOCK_STEPS = [
  {
    id: 1,
    title: 'Block Information',
    description: 'Basic details about the block',
  },
  {
    id: 2,
    title: 'Structure Details',
    description: 'Floors, units, and facilities',
  },
  {
    id: 3,
    title: 'Pricing Configuration',
    description: 'Set prices and pricing rules',
  },
  {
    id: 4,
    title: 'Visibility & Access',
    description: 'Portal and partner settings',
  },
] as const;

// Block detail tabs
export const BLOCK_DETAIL_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'inventory', label: 'Inventory (Floors & Units)' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'sales-leads', label: 'Sales & Leads' },
  { id: 'settings', label: 'Settings' },
] as const;

// Action icons tooltips
export const ACTION_TOOLTIPS = {
  view: 'View block details',
  edit: 'Edit block information',
  inventory: 'Manage inventory and units',
  visibility: 'Toggle visibility on portal',
  more: 'More actions',
} as const;
