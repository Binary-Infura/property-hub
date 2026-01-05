/**
 * Block Pricing Calculation Utilities
 * Handles price calculations, floor-rise pricing, and unit pricing
 */

export interface PriceCalculationParams {
  basePrice: number; // Base price per sq ft
  area: number; // Area in sq ft
  floor: number; // Floor number (1-indexed)
  floorRisePrice: number; // Additional price per floor
}

export interface UnitPriceBreakdown {
  basePrice: number;
  floorRisePrice: number;
  totalPrice: number;
}

/**
 * Calculate unit price based on base price, area, and floor
 * Formula: (Base Price × Area) + (Floor Rise Price × (Floor Number - 1))
 */
export const calculateUnitPrice = ({
  basePrice,
  area,
  floor,
  floorRisePrice,
}: PriceCalculationParams): UnitPriceBreakdown => {
  const basePriceTotal = basePrice * area;
  const floorRisePriceTotal = floorRisePrice * (floor - 1);
  const totalPrice = basePriceTotal + floorRisePriceTotal;

  return {
    basePrice: basePriceTotal,
    floorRisePrice: floorRisePriceTotal,
    totalPrice: Math.round(totalPrice),
  };
};

/**
 * Calculate total units (auto-calculated value)
 * Total Units = Total Floors × Units Per Floor
 */
export const calculateTotalUnits = (totalFloors: number, unitsPerFloor: number): number => {
  return Math.max(0, totalFloors * unitsPerFloor);
};

/**
 * Calculate price per sq ft with floor rise consideration
 * Useful for display purposes
 */
export const calculateEffectivePrice = (
  basePrice: number,
  floor: number,
  floorRisePrice: number,
  area: number,
): number => {
  if (area <= 0) return basePrice;
  const totalPrice = basePrice * area + floorRisePrice * (floor - 1);
  return Math.round(totalPrice / area);
};

/**
 * Generate block code auto-suggestion based on name
 * Converts to uppercase, removes spaces, limits length
 */
export const generateBlockCode = (blockName: string, buildingCode?: string): string => {
  if (!blockName) return '';

  const namePart = blockName
    .toUpperCase()
    .substring(0, 2)
    .replace(/[^A-Z]/g, '');

  const buildingPart = buildingCode
    ? buildingCode.toUpperCase().substring(0, 1).replace(/[^A-Z0-9]/g, '')
    : '';

  const blockPart = 'BLK';
  return `${buildingPart}${blockPart}${namePart}`.substring(0, 10);
};

/**
 * Calculate booking percentage
 * (Booked Units / Total Units) × 100
 */
export const calculateBookingPercentage = (
  bookedUnits: number,
  totalUnits: number,
): number => {
  if (totalUnits === 0) return 0;
  return Math.round((bookedUnits / totalUnits) * 100);
};

/**
 * Calculate revenue generated based on sold units
 */
export const calculateRevenue = (
  bookedUnits: number,
  averageUnitPrice: number,
): number => {
  return bookedUnits * averageUnitPrice;
};

/**
 * Determine demand level based on booking percentage
 * Low: 0-30%, Medium: 31-70%, High: 71-100%
 */
export const calculateDemandLevel = (bookingPercentage: number): 'low' | 'medium' | 'high' => {
  if (bookingPercentage < 30) return 'low';
  if (bookingPercentage < 70) return 'medium';
  return 'high';
};

/**
 * Calculate average unit price across all unit types
 */
export const calculateAverageUnitPrice = (
  basePricePerSqft: number,
  area: number,
): number => {
  return Math.round(basePricePerSqft * area);
};

/**
 * Format number as Indian currency shorthand (L for Lakhs, Cr for Crore)
 */
export const formatPriceShorthand = (price: number): string => {
  if (price >= 10000000) {
    // Crore
    return `₹${(price / 10000000).toFixed(1)}Cr`;
  }
  if (price >= 100000) {
    // Lakh
    return `₹${(price / 100000).toFixed(1)}L`;
  }
  if (price >= 1000) {
    // Thousand
    return `₹${(price / 1000).toFixed(1)}K`;
  }
  return `₹${price}`;
};

/**
 * Calculate price range for a unit type
 */
export const calculatePriceRange = (
  basePrice: number,
  area: number,
  minFloor: number,
  maxFloor: number,
  floorRisePrice: number,
): { min: number; max: number } => {
  const minUnitPrice = calculateUnitPrice({
    basePrice,
    area,
    floor: minFloor,
    floorRisePrice,
  }).totalPrice;

  const maxUnitPrice = calculateUnitPrice({
    basePrice,
    area,
    floor: maxFloor,
    floorRisePrice,
  }).totalPrice;

  return {
    min: Math.min(minUnitPrice, maxUnitPrice),
    max: Math.max(minUnitPrice, maxUnitPrice),
  };
};
