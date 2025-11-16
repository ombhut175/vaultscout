# VaultScout

**Enterprise Knowledge Discovery & Semantic Search Platform**

VaultScout is a multi-tenant document management and semantic search system that enables organizations to securely upload documents, automatically extract and vectorize content, and perform intelligent natural language search across their knowledge base. Built for enterprise knowledge workers and administrators, VaultScout combines document management, AI-powered embeddings, and vector search to make organizational knowledge instantly discoverable.

---

## 🎯 Project Overview

VaultScout bridges the gap between unstructured document storage and intelligent information retrieval. Users upload documents in various formats (PDF, DOCX, TXT), which are automatically processed through a sophisticated pipeline: text extraction → semantic chunking → vector embedding → semantic indexing. This enables powerful natural language search across the entire document corpus with sub-second latency.

**Key Value Propositions:**
- 📄 **Multi-format Support:** Handle PDFs, DOCX, and text files seamlessly
- 🔍 **Intelligent Search:** Find relevant information using natural language, not keywords
- 🏢 **Multi-tenant:** Complete organization isolation with role-based access control
- ⚡ **Low Latency:** Sub-400ms search response times powered by Pinecone serverless
- 🔐 **Enterprise Security:** Role-based access control, ACL-based document access, and fine-grained permissions

---

## 📋 MVP Features

> **⚠️ IMPORTANT:** VaultScout is currently in **MVP phase**. The following features are fully implemented and production-ready. **Additional features are planned for future releases.**

### Current MVP Capabilities (Production Ready)

#### ✅ **Authentication & User Management**
- User registration and login via Supabase Auth
- Email-based authentication with secure sessions
- Role-based access control (Admin, Editor, Viewer)
- Organization and team management
- User group organization for access control

#### ✅ **Document Upload & Processing**
- Single and batch file uploads via REST API
- Support for PDF, DOCX, and TXT file formats
- Automatic text extraction with format-specific parsers
- Intelligent semantic chunking with configurable overlap
- Original document preservation in Supabase Storage
- File versioning and upload tracking
- Comprehensive error handling with descriptive error messages

#### ✅ **Vector Embeddings & Indexing**
- Integration with Hugging Face Inference Endpoints
- BAAI/bge-base-en-v1.5 embeddings model (768-dimensional)
- Batch embedding processing with BullMQ job queues
- Pinecone serverless vector database integration
- Metadata-rich indexing for filtering and sorting
- Automatic content hashing for idempotent operations

#### ✅ **Semantic Search**
- Natural language vector search across documents
- Top-K similarity retrieval with configurable results
- Metadata filtering support
- Real-time search with low latency (P95 < 400ms)
- Relevance scoring and snippet extraction
- Search analytics and query logging

---

## 🚀 Planned Features (Future Releases)

The following features are **NOT** currently available but are on the roadmap and will be added in future iterations:

- **Advanced Search:** Hybrid search (keyword + semantic), faceted search, saved searches
- **Document Management:** Full CRUD operations, document organization, tagging and categorization
- **Analytics & Monitoring:** Search analytics dashboard, ingestion monitoring, performance metrics
- **Collaboration:** Comments, annotations, document sharing, activity logs
- **Content Management:** OCR for scanned documents, document preview generation, full-text indexing
- **API Enhancements:** Webhook support, batch APIs, advanced filtering options
- **Security Enhancements:** SAML/SSO integration, advanced audit logging, data encryption at rest
- **Performance:** Advanced caching, query optimization, distributed processing

---

## 🛠 Tech Stack

### Backend Architecture
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | NestJS + TypeScript | Scalable, modular backend |
| **Database** | PostgreSQL (Supabase) | Relational data & analytics |
| **ORM** | Drizzle | Type-safe database operations |
| **Vector DB** | Pinecone Serverless | High-performance vector search |
| **Embeddings** | Hugging Face Inference Endpoints | AI-powered document embeddings |
| **Job Queues** | BullMQ + Redis | Asynchronous job processing |
| **Authentication** | Supabase Auth | Secure user authentication |
| **File Storage** | Supabase Storage | Document and artifact storage |
| **API Docs** | Swagger/OpenAPI | Interactive API documentation |

### Frontend Architecture
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | Modern React framework |
| **Language** | TypeScript | Type-safe frontend code |
| **State Management** | Zustand + SWR | Lightweight state & data fetching |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first CSS & component library |
| **HTTP Client** | Axios | API communication |
| **Charts** | Recharts | Data visualization |

### Infrastructure & DevOps
- **Node.js 18+** minimum runtime
- **Docker** support for containerization
- **Environment-based configuration** for dev/staging/production
- **Cross-platform** support (Windows, macOS, Linux)

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     VaultScout System                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐          ┌──────────────────────┐      │
│  │   Frontend (Next.js)│◄────────►│  Backend API (NestJS)│      │
│  │  - UI Components    │          │  - REST Endpoints    │      │
│  │  - State Management │          │  - Business Logic    │      │
│  └─────────────────────┘          └────────┬─────────────┘      │
│                                             │                   │
│                ┌────────────────────────────┼───────────────┐   │
│                │                            │               │   │
│        ┌───────▼──────────┐      ┌─────────▼────┐  ┌──────▼──┐ │
│        │ PostgreSQL       │      │   Supabase   │  │  Redis  │ │
│        │ (Relational DB)  │      │   Storage    │  │ (Queue) │ │
│        └──────────────────┘      └──────────────┘  └─────────┘ │
│                                                                  │
│        ┌──────────────┐          ┌──────────────────────────┐   │
│        │   Pinecone   │◄────────│ Hugging Face Embeddings  │   │
│        │ (Vector DB)  │          │ (BAAI/bge-base-en-v1.5) │   │
│        └──────────────┘          └──────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
vaultscout/
├── backend/                          # NestJS Backend Application
│   ├── src/
│   │   ├── modules/                 # Feature modules (domain-driven)
│   │   │   ├── auth/                # Authentication & authorization
│   │   │   ├── users/               # User management & profiles
│   │   │   ├── organizations/       # Organization management
│   │   │   ├── groups/              # Group management & ACLs
│   │   │   ├── documents/           # Document upload & storage
│   │   │   ├── search/              # Semantic search service
│   │   │   ├── huggingface/         # Embeddings integration
│   │   │   ├── pinecone/            # Vector database operations
│   │   │   ├── queues/              # BullMQ job processing
│   │   │   ├── health-check/        # System health monitoring
│   │   │   └── test/                # Testing utilities
│   │   ├── core/                    # Core services & utilities
│   │   │   ├── database/            # Database configuration
│   │   │   └── config/              # Environment configuration
│   │   ├── common/                  # Shared across modules
│   │   │   ├── constants/           # Application constants
│   │   │   ├── filters/             # Global exception filters
│   │   │   ├── guards/              # Auth & role guards
│   │   │   └── helpers/             # Utility functions
│   │   ├── types/                   # Shared TypeScript types
│   │   └── main.ts                  # Application bootstrap
│   ├── drizzle/                     # Database migrations
│   ├── scripts/                     # Utility scripts
│   ├── test/                        # E2E tests
│   ├── docs/                        # Backend documentation
│   ├── package.json
│   ├── tsconfig.json
│   └── drizzle.config.ts
│
├── frontend/                         # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                     # Next.js App Router pages
│   │   │   ├── (auth)/              # Auth pages (login, register)
│   │   │   ├── (other)/             # Public pages
│   │   │   ├── admin/               # Admin dashboard
│   │   │   └── layout.tsx           # Root layout
│   │   ├── components/              # Reusable React components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── helpers/                 # Utility functions
│   │   ├── lib/                     # Core setup & configuration
│   │   ├── utils/                   # General utilities
│   │   ├── constants/               # Frontend constants
│   │   └── styles/                  # Global styles
│   ├── public/                      # Static assets
│   ├── scripts/                     # Build & utility scripts
│   ├── docs/                        # Frontend documentation
│   ├── package.json
│   ├── next.config.mjs
│   └── tsconfig.json
│
├── development/                      # Development & planning docs
│   ├── prd.md                       # Product requirements
│   └── tasks.md                     # Development tasks
│
├── testsprite_tests/                # Integration & E2E tests
│   ├── TC001-TC020/                 # Test cases
│   ├── standard_prd.json            # Test specifications
│   └── testsprite_frontend_test_plan.json
│
└── README.md                        # This file
```

---

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** or **pnpm** - Package manager
- **Git** - Version control
- External service accounts (see [Environment Setup](#environment-setup))

### Environment Setup

VaultScout requires several external services. Set up accounts and obtain credentials:

1. **Supabase** (Database & Auth)
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Get `Project URL` and `API Keys` from settings

2. **Pinecone** (Vector Database)
   - Sign up at [pinecone.io](https://pinecone.io)
   - Create serverless index (768 dimensions, cosine metric)
   - Get `API Key` and `Index Name`

3. **Hugging Face** (Embeddings)
   - Create account at [huggingface.co](https://huggingface.co)
   - Set up Inference Endpoint with `BAAI/bge-base-en-v1.5` model
   - Get `API Token` and `Endpoint URL`

4. **Redis** (Job Processing)
   - Use managed Redis service (e.g., Redis Cloud, Upstash)
   - Or run locally: `docker run -d -p 6379:6379 redis:latest`

### Installation Steps

#### 1. Clone Repository
```bash
git clone <repository-url>
cd vaultscout
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp env.example.txt .env.local
# Edit .env.local with your credentials

# Run database migrations
npm run db:push

# Start development server
npm run start:dev
```

**Backend runs at:** http://localhost:3000
**API Documentation:** http://localhost:3000/api

#### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp env.example.txt .env.local
# Edit .env.local with your backend URL

# Start development server
npm run dev
```

**Frontend runs at:** http://localhost:5322

#### 4. Verify Installation
- Navigate to http://localhost:5322
- Create account or login
- Try uploading a test document
- Test search functionality

---

## 📖 Documentation

### Complete Documentation Index

#### Setup & Configuration
- **[Backend README](./backend/README.md)** - Backend-specific setup and development
- **[Environment Variables](./backend/env.example.txt)** - All configuration options
- **[Database Setup](./backend/docs/drizzle-setup.md)** - Database schema and migrations
- **[Redis Configuration](./backend/docs/redis-connection-management.md)** - Queue setup

#### Development
- **[Backend Development Rules](./backend/docs/rules.md)** - Code standards and patterns
- **[API Documentation](./backend/docs/auth-api-documentation.md)** - API reference
- **[Architecture](./backend/docs/db/)** - System architecture details

#### Deployment
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Step-by-step deployment instructions
- **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Pre-flight checks

#### Testing
- **[Test Cases](./testsprite_tests/)** - Integration and E2E test suite
- **[Testing Strategy](./development/testing-prompt.md)** - Testing approach

---

## 🔧 Development Guide

### Core Concepts

#### Document Upload Flow
1. User submits file via upload endpoint
2. File stored in Supabase Storage (vs-raw-private bucket)
3. Text extracted using appropriate parser (PDF/DOCX/TXT)
4. Content split into semantic chunks (800-1200 characters)
5. Chunks processed for embeddings via BullMQ queue
6. Vectors sent to Hugging Face Inference Endpoint
7. Embeddings upserted to Pinecone with metadata
8. Upload completion notification sent to client

#### Search Flow
1. User submits search query
2. Query embedded via Hugging Face Inference Endpoint
3. Vector search executed against Pinecone index
4. Top-K results retrieved with metadata
5. Snippets extracted and formatted
6. Results returned to client with scores

### Development Commands

#### Backend
```bash
cd backend

# Development mode with hot reload
npm run start:dev

# Run tests
npm run test
npm run test:watch      # Watch mode
npm run test:cov        # Coverage report
npm run test:e2e        # E2E tests

# Code quality
npm run lint            # Fix linting issues
npm run lint:check      # Check without fixing
npm run type-check      # TypeScript validation

# Database
npm run db:push         # Apply migrations
npm run db:generate     # Generate new migration
npm run db:studio       # Open Drizzle Studio
npm run db:backup       # Backup database

# Build & Production
npm run build           # Build for production
npm run start:prod      # Run production build
```

#### Frontend
```bash
cd frontend

# Development
npm run dev             # Start dev server
npm run dev:turbo       # Turbopack mode (faster)

# Build & Deploy
npm run build           # Production build
npm run start           # Run production build

# Code Quality
npm run lint            # Fix linting issues
npm run type-check      # TypeScript validation

# Testing
npm run test:build      # Test production build
```

### Code Organization Best Practices

- **Modules:** Each feature in its own module (`modules/<feature>/`)
- **Services:** Business logic encapsulated in services
- **DTOs:** Input/output validation with Data Transfer Objects
- **Guards:** Authorization logic in auth guards
- **Pipes:** Data transformation in pipes
- **Filters:** Exception handling in global filters
- **Logging:** Structured logging with context throughout

See `backend/docs/rules.md` for comprehensive development standards.

---

## 🔐 Security Features

### Authentication & Authorization
- **Supabase Auth:** Secure email-based authentication
- **Role-Based Access Control (RBAC):** Admin, Editor, Viewer roles
- **Session Management:** Secure cookie-based sessions
- **Token Validation:** JWT token verification on protected routes

### Data Protection
- **Organization Isolation:** Complete multi-tenant separation
- **ACL-Based Access:** Fine-grained document access control
- **Encrypted Storage:** Supabase Storage with encryption at rest
- **Environment Variables:** Sensitive data externalized

### API Security
- **CORS Configuration:** Restricted cross-origin requests
- **Rate Limiting:** Protect against abuse
- **Input Validation:** Comprehensive DTO validation
- **Error Handling:** Non-leaking error responses

### Recommendations for Production
- Enable HTTPS/TLS encryption
- Use private storage buckets with signed URLs
- Implement additional DDoS protection
- Set up comprehensive audit logging
- Regular security audits and penetration testing

---

## 📊 Performance Considerations

### Search Latency Targets
- **P95 Latency:** < 400ms from query to results
- **Query Embedding:** ~100-200ms (Hugging Face)
- **Vector Search:** ~50-100ms (Pinecone)
- **Serialization:** ~50-100ms

### Optimization Strategies
- **Batch Processing:** Embed multiple documents in parallel
- **Connection Pooling:** Reuse database connections
- **Caching:** Cache frequently accessed metadata
- **Index Optimization:** Monitor and optimize Pinecone index

### Scaling Considerations
- **Horizontal Scaling:** Multiple backend instances
- **Async Processing:** BullMQ for long-running operations
- **Vector DB Scaling:** Pinecone serverless handles auto-scaling
- **Load Balancing:** Distribute traffic across instances

---

## 🧪 Testing Strategy

The project includes comprehensive test coverage:

### Test Types
- **Unit Tests:** Individual service and utility testing
- **Integration Tests:** Module and API integration
- **E2E Tests:** Full workflow testing (test cases TC001-TC020)

### Running Tests
```bash
cd backend

# Unit tests
npm run test

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e

# Test-specific environment
npm run test:env
```

See `testsprite_tests/` for detailed test specifications.

---

## 📤 Deployment

### Development Deployment
```bash
# Build applications
npm run build              # Both frontend and backend

# Run production build locally
npm run start:prod         # Backend
npm run start              # Frontend
```

### Production Deployment Options

#### Frontend (Recommended: Vercel)
```bash
cd frontend
npm ci --only=production
npm run build
# Deploy via Vercel CLI or git push
```

#### Backend (Railway, Render, or Self-Hosted)
```bash
cd backend
npm ci --only=production
npm run build
npm run start:prod
```

#### Docker Deployment
```bash
# Build container
docker build -t vaultscout-backend ./backend
docker build -t vaultscout-frontend ./frontend

# Run containers
docker run -p 3000:3000 vaultscout-backend
docker run -p 5322:5322 vaultscout-frontend
```

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed instructions.

---

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failures
- **Check:** DATABASE_URL is correct
- **Check:** PostgreSQL service is running
- **Check:** Network connectivity to Supabase
- **Solution:** Test with `npm run db:verify`

#### Embedding Service Issues
- **Check:** HF_API_TOKEN is valid
- **Check:** Hugging Face Inference Endpoint is active
- **Check:** Endpoint URL is correct
- **Solution:** Test directly with curl to HF endpoint

#### Pinecone Connection Problems
- **Check:** PINECONE_API_KEY is correct
- **Check:** PINECONE_INDEX_NAME exists
- **Check:** Index dimensions match (768)
- **Solution:** Verify in Pinecone dashboard

#### Redis Connection Issues
- **Check:** REDIS_URL is reachable
- **Check:** Redis service is running
- **Check:** No authentication issues
- **Solution:** Test with `redis-cli ping`

### Debug Logging
Enable verbose logging:
```bash
# Backend
NODE_DEBUG=* npm run start:dev

# Frontend
DEBUG=* npm run dev
```

### Getting Help
1. Check the documentation in `/docs` folders
2. Review error logs with context
3. Check application health: http://localhost:3000/health
4. Review API documentation at http://localhost:3000/api

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Follow code standards in `backend/docs/rules.md`
3. Write tests for new features
4. Update documentation
5. Commit with descriptive messages
6. Push and create a Pull Request

### Code Standards
- **Backend:** NestJS best practices, TypeScript strict mode
- **Frontend:** React best practices, TypeScript strict mode
- **Testing:** Unit tests for services, E2E tests for workflows
- **Documentation:** JSDoc comments for complex logic

### Pre-Commit Checklist
- [ ] Code passes linting: `npm run lint:check`
- [ ] TypeScript compiles: `npm run type-check`
- [ ] Tests pass: `npm run test`
- [ ] Documentation updated
- [ ] No hardcoded secrets

---

## 📝 API Reference

### Core Endpoints

#### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - List documents
- `GET /api/documents/:id` - Get document details
- `DELETE /api/documents/:id` - Delete document

#### Search
- `POST /api/search/vector` - Semantic search
- `GET /api/search/history` - Search history

#### Organizations
- `GET /api/organizations` - List organizations
- `POST /api/organizations` - Create organization
- `PUT /api/organizations/:id` - Update organization

#### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

Full API documentation available at: http://localhost:3000/api

---

## 📄 License

[Your License Here]

---

## 🤖 AI-Generated Code Note

This project leverages AI assistance for development. See `backend/docs/rules.md` for AI-first development practices and guidelines used in this codebase.

---

## 📞 Support & Contact

For issues, questions, or suggestions:
1. **Documentation:** Check the docs folder first
2. **Issues:** Open a GitHub issue with detailed information
3. **Discussion:** Start a discussion for general questions
4. **Development Team:** Contact the team for urgent issues

---

## 🗺️ Roadmap

### Current Phase: MVP
- ✅ Core authentication
- ✅ Document upload and processing
- ✅ Semantic search
- ✅ Basic admin dashboard

### Next Phase: Feature Expansion
- Advanced search with filters
- Analytics and monitoring
- Collaboration features
- Performance optimization

### Future Phases
- Enterprise integrations (SAML, SSO)
- Advanced security features
- Distributed processing
- Additional document formats

See `development/prd.md` for detailed roadmap and feature planning.

---

**Built with ❤️ for enterprise knowledge discovery**
