# Property Hub Backend

NestJS backend application for Property Hub with Keycloak authentication.

## Features

- 🔐 **Keycloak JWT Authentication** - JWKS-based token verification
- 🛡️ **Role-Based Access Control** - Realm roles for authority levels
- 🌍 **Region-Based Filtering** - Client roles for regional access
- 🗄️ **PostgreSQL Database** - Prisma ORM for type-safe queries
- ⚡ **Fastify** - High-performance HTTP server
- 📚 **Swagger Documentation** - Auto-generated API docs
- 🐳 **Docker Ready** - Full containerization with Docker Compose

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for containerized setup)
- Keycloak server running (default: http://localhost:8080)

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Start development server**
   ```bash
   npm run start:dev
   ```

6. **Access the application**
   - API: http://localhost:3001
   - Swagger Docs: http://localhost:3001/api/docs

### Docker Setup

1. **Start services**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## Authentication

The backend uses Keycloak JWT tokens for authentication. Tokens must include:

- **Realm Roles** (`realm_access.roles`): Authority levels (e.g., `central-authority`, `commission-manager`, `regional-manager`)
- **Client Roles** (`resource_access.property-hub-frontend.roles`): Region flags (e.g., `region:mumbai_south`, `region:pune_west`)

### Example Token Structure

```json
{
  "sub": "user-id-123",
  "email": "user@example.com",
  "realm_access": {
    "roles": ["commission-manager", "regional-manager"]
  },
  "resource_access": {
    "property-hub-frontend": {
      "roles": ["region:mumbai_south", "region:pune_west"]
    }
  }
}
```

## API Endpoints

### Properties
- `GET /properties` - List all properties (filtered by region)
- `GET /properties/:id` - Get property details
- `POST /properties` - Create new property
- `PATCH /properties/:id` - Update property
- `DELETE /properties/:id` - Delete property

### Leads
- `GET /leads` - List all leads (filtered by region)
- `GET /leads/:id` - Get lead details
- `POST /leads` - Create new lead
- `PATCH /leads/:id` - Update lead
- `DELETE /leads/:id` - Delete lead

### Commissions
- `GET /commissions` - List all commissions (filtered by region)
- `GET /commissions/:id` - Get commission details
- `POST /commissions` - Create new commission
- `PATCH /commissions/:id` - Update commission
- `DELETE /commissions/:id` - Delete commission

### Users
- `GET /users/me` - Get current user metadata
- `PATCH /users/me` - Update current user metadata

## Database

### Schema Management

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
```

### Models

- **Region** - Regional boundaries
- **Property** - Real estate properties
- **Lead** - Potential buyers/clients
- **Visit** - Property visit scheduling
- **Commission** - Agent commission tracking
- **UserMetadata** - Non-auth user data

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `KEYCLOAK_REALM_URL` | Keycloak realm URL | - |
| `KEYCLOAK_CLIENT_ID` | Keycloak client ID | `property-hub-frontend` |
| `JWT_SECRET` | Fallback JWT secret | - |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

## Project Structure

```
src/
├── auth/                   # Authentication module
│   ├── guards/            # JWT, Roles, Regions guards
│   ├── jwt.strategy.ts    # Passport JWT strategy
│   └── auth.module.ts
├── common/                # Shared utilities
│   ├── decorators/        # @Roles, @Regions, @CurrentUser
│   └── interfaces/        # TypeScript interfaces
├── modules/               # Business modules
│   ├── properties/
│   ├── leads/
│   ├── commissions/
│   └── users/
├── database/              # Database layer
│   ├── prisma/
│   └── prisma.service.ts
├── app.module.ts          # Main app module
└── main.ts                # Bootstrap
```

## License

ISC
