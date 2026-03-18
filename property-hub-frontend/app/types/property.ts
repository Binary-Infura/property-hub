/**
 * Property Data Types for Real Estate Management
 * Represents a property that contains towers, floors, and units
 */

export type PropertyStatus = 'submitted' | 'approved' | 'rejected' | 'available' | 'sold' | 'reserved';
export type PropertyType = 'residential' | 'commercial' | 'mixed-use';
export type PropertyCategory = 'flat' | 'plot' | 'shop' | 'villa' | 'office' | 'warehouse';

export interface Tower {
  id: string;
  projectId: string;
  name: string;
  totalFloors?: number;
  createdAt: Date;
  updatedAt: Date;
  units?: any[];
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
  totalTowers: number;
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
  totalTowers: number;
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
  towers: Tower[];
  country?: string;
  continent?: string;
  cityAllocationId?: string;
  videoUrl?: string;
  buyerName?: string;
  buyerPhone?: string;
  salePrice?: number;
  soldAt?: Date;
  onboardingStep?: number;
}
