# Property Hub - Development Authentication

This project has migrated from Keycloak to a local authentication system.

## Seed Credentials

For development and testing, you can use the following credentials. All accounts use the same password: **password123**

| Role | Email |
|------|-------|
| Central Authority | central@propertyhub.com |
| Regional Manager (Mumbai) | regional@propertyhub.com |
| Regional Manager (Pune) | rm.pune@propertyhub.com |
| Property Partner | property@propertyhub.com |
| Onboarding Manager | onboard@propertyhub.com |
| Consultant | testconsultant@gmail.com |
| Marketing Manager | marketing1@propertyhub.com |
| Buyer | buyer@test.com |
| Loan Adviser | loan@propertyhub.com |
| Visit Executive | visit@propertyhub.com |
| Channel Partner | cp@test.com |

## How to run Seeder

To populate the database with these users, run the following command in the `property-hub-backend` directory:

```bash
npm run seed
```

This will create the locations, regions, users, and profiles required for testing all features of the application.
