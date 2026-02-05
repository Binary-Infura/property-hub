/**
 * Property Data Types for Real Estate Management
 * Represents a property that contains buildings, blocks, and units
 */

export type PropertyStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'published' | 'available' | 'sold' | 'reserved';
export type PropertyType = 'residential' | 'commercial' | 'mixed-use';
export type PropertyCategory = 'flat' | 'plot' | 'shop' | 'villa' | 'office' | 'warehouse';

export interface Building {
  id: string;
  propertyId: string;
  name: string;
  code: string;
  totalFloors: number;
  description?: string;
}

export interface PropertyFormData {
  title: string;
  propertyType: PropertyType;
  propertyCategory?: PropertyCategory;
  location: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalArea: number; // in sq ft
  totalBuildings: number;
  totalUnits: number;
  startingPrice: number;
  description: string;
  amenities: string[];
  images: File[];
  brochure?: File;
  specification?: File;
}

export interface Property {
  id: string;
  title: string;
  propertyType: PropertyType;
  propertyCategory?: PropertyCategory;
  location: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalArea: number;
  totalBuildings: number;
  totalUnits: number;
  startingPrice: number;
  description: string;
  amenities: string[];
  images: File[];
  brochure?: File;
  specification?: File;
  status: PropertyStatus;
  createdAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  feedback?: string;
  buildings: Building[];
  country?: string;
  continent?: string;
  regionId?: string;
  videoUrl?: string;
}
