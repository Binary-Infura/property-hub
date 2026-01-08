/**
 * Block Data Types for Real Estate Management
 * Represents a block within a building, containing units, pricing, and inventory
 */

export type BlockStatus = 'draft' | 'pre-launch' | 'active' | 'hold' | 'sold-out';
export type BlockType = 'residential' | 'commercial';
export type DemandLevel = 'low' | 'medium' | 'high';

export interface UnitTypePricing {
  type: string; // e.g., "2BHK", "3BHK", "4BHK"
  basePrice: number; // Price per sq ft
  units: number; // Count of this unit type in block
}

export interface FloorDetails {
  floorNumber: number;
  totalUnits: number;
  availableUnits: number;
  bookedUnits: number;
  units: Unit[];
}

export interface Unit {
  id: string;
  unitNumber: string;
  type: string; // e.g., "2BHK", "3BHK"
  area: number; // in sq ft
  price: number;
  status: 'available' | 'booked' | 'reserved';
  floor: number;
}

export interface BlockOfferDetails {
  enabled: boolean;
  description: string;
  discountPercentage?: number;
  discountAmount?: number;
  validUntil?: Date;
}

export interface Block {
  // Identification
  id: string;
  projectId: string;
  buildingId: string;
  
  // Basic Information
  name: string;
  code: string;
  type: BlockType;
  status: BlockStatus;
  possessionDate: Date;

  // Structure
  totalFloors: number;
  unitsPerFloor: number;
  totalUnits: number; // auto-calculated
  liftCount: number;
  fireExitCount: number;

  // Pricing
  basePricePerSqft: number; // ₹/sq ft
  floorRisePricePerFloor: number; // Additional price per floor
  unitTypePricing: UnitTypePricing[];
  offers: BlockOfferDetails;

  // Visibility & Access
  showOnPortal: boolean;
  allowChannelPartners: boolean;
  allowConsultants: boolean;
  eligibleForBoostCampaigns: boolean;

  // Inventory
  floors: FloorDetails[];
  totalAvailableUnits: number;
  totalBookedUnits: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  publishedAt?: Date;
  draftData?: Partial<Block>; // For auto-saved drafts
}

export interface BlockFormData {
  // Step 1: Block Information
  name: string;
  code: string;
  type: BlockType;
  status: BlockStatus;
  possessionDate: string; // ISO date string

  // Step 2: Structure Details
  totalFloors: string | number;
  unitsPerFloor: string | number;
  liftCount: string | number;
  fireExitCount: string | number;

  // Step 3: Pricing Configuration
  basePricePerSqft: string | number;
  floorRisePricePerFloor: string | number;
  unitTypePricing: UnitTypePricingForm[];
  offersEnabled: boolean;
  offerDescription: string;

  // Step 4: Visibility & Access Control
  showOnPortal: boolean;
  allowChannelPartners: boolean;
  allowConsultants: boolean;
  eligibleForBoostCampaigns: boolean;
}

export interface UnitTypePricingForm {
  type: string;
  basePrice: string | number;
  units: string | number;
}

// Form validation errors
export interface BlockFormErrors {
  [key: string]: string;
}
