# Property Hub Test Users

This document contains the credentials for the testing users seeded in the database. 

## Default Password for All Users
All test users share the same common password:
**`password123`**

## Super User (Multiple Roles)
| Role(s) | Email | Primary Role |
| -- | -- | -- |
| All Roles | `superuser@propertyhub.com` | `CENTRAL_AUTHORITY` |

## Individual Role Users

| Role | Email |
| :--- | :--- |
| **Central Authority** | `central_authority@propertyhub.com` |
| **Property Partner** | `property_partner@propertyhub.com` |
| **Buyer** | `buyer@propertyhub.com` |
| **Consultant** | `consultant@propertyhub.com` |
| **Loan Partner** | `loan_partner@propertyhub.com` |
| **Broker** | `broker@propertyhub.com` |
| **Visit Executive** | `visit_executive@propertyhub.com` |

## Seeding Command
If you ever need to reset or recreate these users, you can run the seeding script:

```bash
npx ts-node scripts/seed-data.ts
# OR
npm run db:seed
```
