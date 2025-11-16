# VaultScout

Enterprise knowledge discovery and semantic search system that enables organizations to upload documents, convert them into embeddings, and perform intelligent semantic search.

## Features

- **User Management:** Create and manage users with role-based access control
- **Organization Management:** Multi-tenant architecture with organization isolation
- **Group Management:** Organize users into groups for document access control
- **Document Management:** Upload and process documents (PDF, DOCX, TXT) with automatic chunking
- **Semantic Search:** Natural language search across documents using vector embeddings
- **Access Control:** Fine-grained ACL-based document access control
- **Admin Dashboard:** System analytics, monitoring, and health status

## Tech Stack

### Backend
- NestJS (TypeScript)
- PostgreSQL (via Supabase)
- Drizzle ORM
- Pinecone (Vector Database)
- Redis (BullMQ for job queues)
- Hugging Face (Embeddings)

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Zustand + SWR (State Management)
- Tailwind CSS + shadcn/ui
- Axios

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (or Supabase account)
- Redis
- Pinecone account
- Hugging Face API token

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vaultscout
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example.txt .env.local
   # Edit .env.local with your credentials
   npm run db:push
   npm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp env.example.txt .env.local
   # Edit .env.local with your credentials
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3656
   - Backend API: http://localhost:3000
   - API Docs: http://localhost:3000/api

## Documentation

### Setup and Configuration
- **[Environment Variables](./ENVIRONMENT_VARIABLES.md)** - Complete guide to all environment variables
- **[Backend README](./backend/README.md)** - Backend setup and API documentation
- **[Frontend README](./frontend/README.md)** - Frontend setup and development guide

### Deployment
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Comprehensive deployment instructions
- **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment checklist

### Database
- **[Database Migrations](./backend/DATABASE_MIGRATIONS.md)** - Migration management guide

### Development Guidelines
- **[Backend Rules](./backend/docs/rules.md)** - Backend development guidelines
- **[Frontend Rules](./frontend/docs/rules.md)** - Frontend development guidelines

## Project Structure

```
.
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── users/      # User management
│   │   │   ├── organizations/ # Organization management
│   │   │   ├── groups/     # Group management
│   │   │   ├── documents/  # Document management
│   │   │   └── search/     # Search functionality
│   │   ├── core/           # Core utilities
│   │   └── common/         # Shared resources
│   └── docs/               # Backend documentation
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── helpers/       # Utility functions
│   │   ├── lib/           # Core setup
│   │   └── constants/     # Application constants
│   └── docs/              # Frontend documentation
└── development/           # Development documentation

```

## Development

### Backend Development

```bash
cd backend

# Development mode with hot reload
npm run start:dev

# Run tests
npm run test

# Run linter
npm run lint

# Database migrations
npm run db:push
```

### Frontend Development

```bash
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## Deployment

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for a comprehensive deployment guide.

### Quick Deployment Steps

1. **Configure production environment**
   ```bash
   # Backend
   cp backend/.env.production.template backend/.env.production
   # Edit with production values
   
   # Frontend
   cp frontend/.env.production.template frontend/.env.production
   # Edit with production values
   ```

2. **Build applications**
   ```bash
   # Backend
   cd backend
   npm ci --only=production
   npm run build
   
   # Frontend
   cd frontend
   npm ci --only=production
   npm run build
   ```

3. **Deploy to your platform**
   - Vercel (Frontend - Recommended)
   - Railway/Render (Backend)
   - Docker containers
   - Traditional servers

## Environment Variables

All environment variables are documented in [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md).

**Required Services:**
- Supabase (Authentication & Database)
- Redis (Job Queues)
- Pinecone (Vector Storage)
- Hugging Face (Embeddings)

## API Documentation

When running in development mode, API documentation is available at:
- Swagger UI: http://localhost:3000/api

## Security

- All API endpoints require authentication
- Role-based access control (Admin, Editor, Viewer)
- ACL-based document access control
- Secure cookie-based sessions
- Environment variables for sensitive data
- CORS configuration for cross-origin requests

## Contributing

1. Follow the development guidelines in `backend/docs/rules.md` and `frontend/docs/rules.md`
2. Write tests for new features
3. Update documentation
4. Submit pull requests

## License

[Your License Here]

## Support

For issues or questions:
1. Check the documentation
2. Review the troubleshooting sections
3. Check application logs
4. Contact the development team