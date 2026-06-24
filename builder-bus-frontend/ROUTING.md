# BuilderBus Routing Architecture

## Overview

BuilderBus uses a **buyer-first, role-based routing architecture** where:
- **Buyers** use the shortest and cleanest dashboard URL: `/dashboard`
- **All other roles** use role-based root routes: `/{role}/dashboard`
- **One role = one dashboard route** (no shared dashboards)

## Canonical Dashboard Routes

| Role | Route | Description |
|------|-------|-------------|
| Buyer (End User) | `/dashboard` | Shortest URL, reserved exclusively for buyers |
| Consultant | `/consultant/dashboard` | Consultant-only route |
| Builder / Developer | `/builder/dashboard` | Builder-only route |
| Admin | `/admin/dashboard` | Admin-only route |
| Loan Partner | `/loan-partner/dashboard` | Loan Partner-only route |
| Channel Partner | `/channel-partner/dashboard` | Channel Partner-only route |

## Routing Rules

### 1. `/dashboard`
- **Reserved exclusively for Buyer (End User)**
- Must never be reused for other roles
- This is the shortest and cleanest URL for the primary user type

### 2. `/consultant/dashboard`
- **Consultant-only route**
- Consultants manage clients, consultations, and property matches

### 3. `/builder/dashboard`
- **Builder-only route**
- Builders submit and manage property submissions

### 4. `/admin/dashboard`
- **Admin-only route**
- Admins review and approve property submissions

### 5. `/loan-partner/dashboard`
- **Loan Partner-only route**
- Loan Partners manage loan applications, guide users through loan journey, validate documents, and coordinate with banks

### 6. `/channel-partner/dashboard`
- **Channel Partner-only route**
- Channel Partners submit leads, promote properties, track commissions, and manage their performance metrics

## Forbidden Routes

The following route patterns are **NOT allowed**:
- ❌ `/dashboard/admin`
- ❌ `/dashboard/builder`
- ❌ `/dashboard/consultant`
- ❌ `/user/dashboard`

These patterns violate the routing principle and should never be created.

## Redirection Logic

When authentication is implemented, if a user accesses a dashboard route that does not match their role, they should be redirected to the correct role dashboard.

### Examples:
- **Consultant** → `/dashboard` → redirect to `/consultant/dashboard`
- **Builder** → `/admin/dashboard` → redirect to `/builder/dashboard`
- **Buyer** → `/consultant/dashboard` → redirect to `/dashboard`
- **Loan Partner** → `/dashboard` → redirect to `/loan-partner/dashboard`
- **Channel Partner** → `/admin/dashboard` → redirect to `/channel-partner/dashboard`

## Implementation

### Routing Utility

The routing logic is centralized in `/app/lib/routing.ts`:

```typescript
import { getDashboardRoute, getRoleFromPath, getRedirectTarget } from '@/app/lib/routing';

// Get the canonical route for a role
const buyerRoute = getDashboardRoute('buyer'); // '/dashboard'
const consultantRoute = getDashboardRoute('consultant'); // '/consultant/dashboard'
const loanPartnerRoute = getDashboardRoute('loan-partner'); // '/loan-partner/dashboard'
const channelPartnerRoute = getDashboardRoute('channel-partner'); // '/channel-partner/dashboard'

// Get role from a path
const role = getRoleFromPath('/dashboard'); // 'buyer'

// Get redirect target if needed
const redirect = getRedirectTarget('/dashboard', 'channel-partner'); // '/channel-partner/dashboard'
```

### Folder Structure

```
/app
  /dashboard                (buyer dashboard)
    /layout.tsx
    /page.tsx
  /consultant
    /dashboard               (consultant dashboard)
      /layout.tsx
      /page.tsx
  /builder
    /dashboard               (builder dashboard)
      /layout.tsx
      /page.tsx
  /admin
    /dashboard               (admin dashboard)
      /layout.tsx
      /page.tsx
  /loan-partner
    /dashboard               (loan partner dashboard)
      /layout.tsx
      /page.tsx
  /channel-partner
    /dashboard               (channel partner dashboard)
      /layout.tsx
      /page.tsx
  /lib
    /routing.ts              (routing utilities)
```

### Layout Files

Each dashboard route has a dedicated layout file that:
- Provides consistent navigation
- Enforces role-based access (when authentication is added)
- Contains role-specific metadata

## Enforcement

- Routing rules must be enforced centrally
- No route should serve multiple roles
- Keep routing simple, explicit, and predictable
- All routing logic is centralized in `/app/lib/routing.ts`

## Future: Authentication Integration

When authentication is implemented:

1. **Middleware** should check user role and redirect to appropriate dashboard
2. **Layout files** should enforce role-based access
3. **Routing utility** provides the logic for redirection decisions

Example middleware logic:
```typescript
// When user accesses /dashboard but is a consultant
if (userRole === 'consultant' && pathname === '/dashboard') {
  redirect('/consultant/dashboard');
}
```

## Notes

- This routing architecture is **buyer-first** - buyers get the shortest URL
- All other roles use explicit role-based routes for clarity
- The structure is designed to be simple, predictable, and maintainable
- No authentication logic is included in this routing structure (to be added separately)

