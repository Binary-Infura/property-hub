/**
 * Block Validation Utilities
 * Handles form validation, inline validation, and error messages
 */

import { BlockFormData, BlockFormErrors } from '@/app/types/block';

export const validateBlockForm = (data: Partial<BlockFormData>): BlockFormErrors => {
  const errors: BlockFormErrors = {};

  // Step 1 validations
  if (!data.name?.trim()) {
    errors.name = 'Block name is required';
  }

  if (!data.code?.trim()) {
    errors.code = 'Block code is required';
  } else if (data.code.length > 10) {
    errors.code = 'Block code must be 10 characters or less';
  }

  if (!data.type) {
    errors.type = 'Block type is required';
  }

  if (!data.status) {
    errors.status = 'Launch status is required';
  }

  if (!data.possessionDate) {
    errors.possessionDate = 'Possession date is required';
  } else {
    const possessionDate = new Date(data.possessionDate);
    const today = new Date();
    if (possessionDate < today) {
      errors.possessionDate = 'Possession date must be in the future';
    }
  }

  // Step 2 validations
  const totalFloors = parseInt(String(data.totalFloors), 10);
  if (!data.totalFloors || totalFloors <= 0) {
    errors.totalFloors = 'Total floors must be greater than 0';
  } else if (totalFloors > 100) {
    errors.totalFloors = 'Total floors cannot exceed 100';
  }

  const unitsPerFloor = parseInt(String(data.unitsPerFloor), 10);
  if (!data.unitsPerFloor || unitsPerFloor <= 0) {
    errors.unitsPerFloor = 'Units per floor must be greater than 0';
  } else if (unitsPerFloor > 50) {
    errors.unitsPerFloor = 'Units per floor cannot exceed 50';
  }

  const liftCount = parseInt(String(data.liftCount), 10);
  if (data.liftCount !== '' && data.liftCount !== undefined) {
    if (liftCount < 0 || liftCount > 20) {
      errors.liftCount = 'Lift count must be between 0 and 20';
    }
  }

  const fireExitCount = parseInt(String(data.fireExitCount), 10);
  if (data.fireExitCount !== '' && data.fireExitCount !== undefined) {
    if (fireExitCount < 0 || fireExitCount > 10) {
      errors.fireExitCount = 'Fire exit count must be between 0 and 10';
    }
  }

  // Step 3 validations
  const basePrice = parseFloat(String(data.basePricePerSqft));
  if (!data.basePricePerSqft || basePrice <= 0) {
    errors.basePricePerSqft = 'Base price per sq ft must be greater than 0';
  }

  const floorRisePrice = parseFloat(String(data.floorRisePricePerFloor));
  if (data.floorRisePricePerFloor !== '' && data.floorRisePricePerFloor !== undefined) {
    if (floorRisePrice < 0) {
      errors.floorRisePricePerFloor = 'Floor-rise price cannot be negative';
    }
  }

  // Validate unit type pricing
  if (data.unitTypePricing && Array.isArray(data.unitTypePricing)) {
    data.unitTypePricing.forEach((pricing, idx) => {
      if (!pricing.type?.trim()) {
        errors[`unitTypePricing_${idx}_type`] = 'Unit type is required';
      }
      const price = parseFloat(String(pricing.basePrice));
      if (!pricing.basePrice || price <= 0) {
        errors[`unitTypePricing_${idx}_basePrice`] = 'Price must be greater than 0';
      }
      const units = parseInt(String(pricing.units), 10);
      if (!pricing.units || units <= 0) {
        errors[`unitTypePricing_${idx}_units`] = 'Unit count must be greater than 0';
      }
    });
  }

  // Step 4 validation (offer description required if offers enabled)
  if (data.offersEnabled && !data.offerDescription?.trim()) {
    errors.offerDescription = 'Offer description is required when offers are enabled';
  }

  return errors;
};

export const validateStep = (step: number, data: Partial<BlockFormData>): BlockFormErrors => {
  const errors: BlockFormErrors = {};

  switch (step) {
    case 1:
      // Block Information validation
      if (!data.name?.trim()) {
        errors.name = 'Block name is required';
      }
      if (!data.code?.trim()) {
        errors.code = 'Block code is required';
      } else if (data.code.length > 10) {
        errors.code = 'Block code must be 10 characters or less';
      }
      if (!data.type) {
        errors.type = 'Block type is required';
      }
      if (!data.status) {
        errors.status = 'Launch status is required';
      }
      if (!data.possessionDate) {
        errors.possessionDate = 'Possession date is required';
      } else {
        const possessionDate = new Date(data.possessionDate);
        const today = new Date();
        if (possessionDate < today) {
          errors.possessionDate = 'Possession date must be in the future';
        }
      }
      break;

    case 2:
      // Structure Details validation
      const totalFloors = parseInt(String(data.totalFloors), 10);
      if (!data.totalFloors || totalFloors <= 0) {
        errors.totalFloors = 'Total floors must be greater than 0';
      } else if (totalFloors > 100) {
        errors.totalFloors = 'Total floors cannot exceed 100';
      }

      const unitsPerFloor = parseInt(String(data.unitsPerFloor), 10);
      if (!data.unitsPerFloor || unitsPerFloor <= 0) {
        errors.unitsPerFloor = 'Units per floor must be greater than 0';
      } else if (unitsPerFloor > 50) {
        errors.unitsPerFloor = 'Units per floor cannot exceed 50';
      }

      const liftCount = parseInt(String(data.liftCount), 10);
      if (data.liftCount !== '' && data.liftCount !== undefined) {
        if (liftCount < 0 || liftCount > 20) {
          errors.liftCount = 'Lift count must be between 0 and 20';
        }
      }

      const fireExitCount = parseInt(String(data.fireExitCount), 10);
      if (data.fireExitCount !== '' && data.fireExitCount !== undefined) {
        if (fireExitCount < 0 || fireExitCount > 10) {
          errors.fireExitCount = 'Fire exit count must be between 0 and 10';
        }
      }
      break;

    case 3:
      // Pricing Configuration validation
      const basePrice = parseFloat(String(data.basePricePerSqft));
      if (!data.basePricePerSqft || basePrice <= 0) {
        errors.basePricePerSqft = 'Base price per sq ft must be greater than 0';
      }

      const floorRisePrice = parseFloat(String(data.floorRisePricePerFloor));
      if (data.floorRisePricePerFloor !== '' && data.floorRisePricePerFloor !== undefined) {
        if (floorRisePrice < 0) {
          errors.floorRisePricePerFloor = 'Floor-rise price cannot be negative';
        }
      }

      if (data.unitTypePricing && Array.isArray(data.unitTypePricing)) {
        data.unitTypePricing.forEach((pricing, idx) => {
          if (!pricing.type?.trim()) {
            errors[`unitTypePricing_${idx}_type`] = 'Unit type is required';
          }
          const price = parseFloat(String(pricing.basePrice));
          if (!pricing.basePrice || price <= 0) {
            errors[`unitTypePricing_${idx}_basePrice`] = 'Price must be greater than 0';
          }
          const units = parseInt(String(pricing.units), 10);
          if (!pricing.units || units <= 0) {
            errors[`unitTypePricing_${idx}_units`] = 'Unit count must be greater than 0';
          }
        });
      }

      if (data.offersEnabled && !data.offerDescription?.trim()) {
        errors.offerDescription = 'Offer description is required when offers are enabled';
      }
      break;

    case 4:
      // Visibility & Access Control validation (minimal validation here)
      // All fields are toggles, so no required field validation needed
      break;
  }

  return errors;
};

// Auto-suggest block code based on block name
export const suggestBlockCode = (name: string): string => {
  if (!name) return '';
  return name
    .toUpperCase()
    .replace(/\s+/g, '-')
    .substring(0, 10)
    .replace(/[^A-Z0-9-]/g, '');
};

// Format price to Indian currency
export const formatIndianPrice = (price: number | string): string => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '₹0';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// Format price with commas
export const formatPriceWithCommas = (price: number | string): string => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '0';

  return num.toLocaleString('en-IN');
};
