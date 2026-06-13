# Property Hub

Property Hub is a multi-package monorepo for a real estate platform, including:

- `property-hub-backend` — NestJS API server with Keycloak authentication, Prisma ORM, and PostgreSQL support.
- `property-hub-frontend` — Next.js web application for buyers, partners, and authority users.
- `property-hub-mobile` — Expo React Native mobile application.
- `property-hub-scraper` — Next.js scraper/worker codebase for background scraping and automation.

## Repository structure

```
property-hub/
├── property-hub-backend/    # NestJS backend API + database scripts
├── property-hub-frontend/   # Next.js frontend application
├── property-hub-mobile/     # Expo mobile application
├── property-hub-scraper/    # Scraper / worker app
├── nginx.conf
├── FULL_SYSTEM_DOCUMENTATION.md
└── test-users-credentials.md
```

## Getting started

### Prerequisites

- Node.js 20+
- pnpm, npm, or yarn installed
- PostgreSQL for backend database
- Keycloak or compatible identity provider for authentication
- Redis if using the scraper worker
- Expo CLI for mobile development (`npm install -g expo-cli`)

### Recommended workflow

Each package manages its own dependencies and scripts. From the repository root, change into the package folder first.

## Backend (`property-hub-backend`)

### Install dependencies

```bash
cd property-hub-backend
npm install
```

### Environment setup

```bash
cp .env.example .env
# Edit .env with your database, Keycloak, and app-specific settings
```

### Generate Prisma client & run migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Start in development mode

```bash
npm run start:dev
```

### Useful commands

- `npm run build` — build the backend
- `npm run start` — start the backend in production mode
- `npm run prisma:studio` — launch Prisma Studio
- `npm run seed` — run seed scripts

## Frontend (`property-hub-frontend`)

### Install dependencies

```bash
cd property-hub-frontend
npm install
```

### Start development server

```bash
npm run dev
```

The frontend runs by default on `http://localhost:3101`.

### Build and production

```bash
npm run build
npm run start
```

## Scraper (`property-hub-scraper`)

### Install dependencies

```bash
cd property-hub-scraper
npm install
```

### Start development server

```bash
npm run dev
```

### Run worker process

```bash
npm run dev:worker
```

The scraper app runs by default on `http://localhost:3103`.

## Mobile app (`property-hub-mobile`)

### Install dependencies

```bash
cd property-hub-mobile
npm install
```

### Start Expo

```bash
npm run start
```

### Launch on platform

```bash
npm run android
npm run ios
npm run web
```

## Notes

- The backend uses Keycloak JWT authentication and role-based access control.
- The frontend is built with Next.js and the mobile app uses Expo.
- The backend service port is typically `3001` and the frontend port is `3101`.
- Each package is self-contained, so run commands in the corresponding package folder.

## References

- `property-hub-backend/README.md`
- `property-hub-frontend/README.md`
- `property-hub-scraper/README.md`
