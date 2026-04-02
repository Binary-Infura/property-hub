const { isRoleCombinationValid } = require('./src/common/utils/role-validator.util');
const { UserRole } = require('./src/common/enums/role.enum');

const testCases = [
  { roles: [UserRole.BUYER], expected: true },
  { roles: [UserRole.PROPERTY_PARTNER], expected: true },
  { roles: [UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY], expected: false },
  { roles: [UserRole.PROPERTY_PARTNER, UserRole.LOAN_PARTNER], expected: false },
  { roles: [UserRole.PROPERTY_PARTNER, UserRole.GROWTH_PARTNER], expected: false },
  { roles: [UserRole.CENTRAL_AUTHORITY, UserRole.LOAN_PARTNER], expected: false },
  { roles: [UserRole.CENTRAL_AUTHORITY, UserRole.BUYER], expected: false },
  { roles: [UserRole.CENTRAL_AUTHORITY, UserRole.GROWTH_PARTNER], expected: true },
  { roles: [UserRole.GROWTH_PARTNER, UserRole.LOAN_PARTNER], expected: false },
  { roles: [UserRole.BROKER, UserRole.CONSULTANT], expected: false },
  { roles: [UserRole.BUYER, UserRole.BROKER], expected: false },
];

testCases.forEach((tc, i) => {
  const { valid, reason } = isRoleCombinationValid(tc.roles);
  if (valid === tc.expected) {
    console.log(`Test Case ${i + 1}: PASSED (${tc.roles.join(', ')})`);
  } else {
    console.error(`Test Case ${i + 1}: FAILED (${tc.roles.join(', ')}) - Expected ${tc.expected}, got ${valid}. Reason: ${reason}`);
  }
});
