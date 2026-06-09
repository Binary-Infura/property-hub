import { BadRequestException } from '@nestjs/common';
import { UserRole } from '../enums/role.enum';

/**
 * Role incompatibility rules:
 * 1. PROPERTY_PARTNER cannot coexist with CENTRAL_AUTHORITY, LOAN_PARTNER, or GROWTH_PARTNER.
 * 2. CENTRAL_AUTHORITY cannot coexist with PROPERTY_PARTNER, LOAN_PARTNER, or BUYER.
 * 3. GROWTH_PARTNER cannot coexist with PROPERTY_PARTNER or LOAN_PARTNER.
 */
const INCOMPATIBLE_MAP: Record<UserRole, UserRole[]> = {
  [UserRole.PROPERTY_PARTNER]: [
    UserRole.CENTRAL_AUTHORITY,
    UserRole.LOAN_PARTNER,
    UserRole.GROWTH_PARTNER,
  ],
  [UserRole.CENTRAL_AUTHORITY]: [
    UserRole.PROPERTY_PARTNER,
    UserRole.LOAN_PARTNER,
    UserRole.BUYER,
  ],
  // These are handled by the symmetry above, but included for completeness if used directly
  [UserRole.LOAN_PARTNER]: [
    UserRole.PROPERTY_PARTNER,
    UserRole.CENTRAL_AUTHORITY,
    UserRole.GROWTH_PARTNER,
  ],
  [UserRole.GROWTH_PARTNER]: [UserRole.PROPERTY_PARTNER, UserRole.LOAN_PARTNER],
  [UserRole.BUYER]: [UserRole.CENTRAL_AUTHORITY],
  // Others have no restrictions
};

/**
 * Validates a combination of roles.
 * @param roles Array of UserRole
 * @returns true if valid, throws BadRequestException if invalid
 */
export function validateRoleCombination(roles: UserRole[]): boolean {
  if (!roles || roles.length <= 1) return true;

  for (const role of roles) {
    const incompatible = INCOMPATIBLE_MAP[role] || [];
    for (const otherRole of roles) {
      if (role !== otherRole && incompatible.includes(otherRole)) {
        throw new BadRequestException(
          `Role combination invalid: ${role} and ${otherRole} cannot be assigned to the same user.`,
        );
      }
    }
  }

  return true;
}

/**
 * Pure version for use in decorators or other non-exception throwing contexts.
 */
export function isRoleCombinationValid(roles: UserRole[]): { valid: boolean; reason?: string } {
  if (!roles || roles.length <= 1) return { valid: true };

  for (const role of roles) {
    const incompatible = INCOMPATIBLE_MAP[role] || [];
    for (const otherRole of roles) {
      if (role !== otherRole && incompatible.includes(otherRole)) {
        return {
          valid: false,
          reason: `${role} and ${otherRole} are incompatible.`,
        };
      }
    }
  }

  return { valid: true };
}
