# VaultScout Frontend

Enterprise knowledge discovery and semantic search application built with Next.js 14.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **State Management:** Zustand + SWR
- **Styling:** Tailwind CSS + shadcn/ui
- **HTTP Client:** Axios
- **Animations:** Framer Motion

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages
│   ├── (other)/           # Main application pages
│   │   ├── dashboard/     # Dashboard
│   │   ├── users/         # User management
│   │   ├── organizations/ # Organization management
│   │   ├── groups/        # Group management
│   │   ├── documents/     # Document management
│   │   └── search/        # Search interface
│   └── admin/             # Admin dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── users/            # User-related components
│   ├── organizations/    # Organization components
│   ├── groups/           # Group components
│   ├── documents/        # Document components
│   ├── search/           # Search components
│   └── admin/            # Admin components
├── hooks/                # Custom React hooks
├── helpers/              # Business logic utilities
├── lib/                  # Core setup and configuration
├── constants/            # Application constants
└── types/                # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Backend API running (see backend/README.md)

### Installation

```bash
# Install dependencies
npm install
# or
bun install
```

### Configuration

**📖 Complete Documentation:** See [ENVIRONMENT_VARIABLES.md](../ENVIRONMENT_VARIABLES.md) in the root directory for comprehensive documentation.

**Quick Setup:**

```bash
# Development
cp env.example.txt .env.local
# Edit .env.local with your values

# Production
cp .env.production.template .env.production
# Edit .env.production with your production values
```

**Required Environment Variables:**

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Application Configuration
NEXT_PUBLIC_APP_NAME=VaultScout
NEXT_PUBLIC_THEME=edtech
NODE_ENV=development
```

**⚠️ Important:** Only `NEXT_PUBLIC_*` variables are exposed to the browser.

### Development

```bash
# Start development server
npm run dev
# or
bun dev

# Open http://localhost:3000
```

### Build

```bash
# Create production build
npm run build

# Start production server
npm run start
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Development Guidelines

### Mandatory File Usage

**ALWAYS use these helper files:**

1. **API Requests:** `@/helpers/request`
   ```typescript
   import { apiRequest } from '@/helpers/request';
   
   const response = await apiRequest.get('/users');
   ```

2. **Error Handling:** `@/helpers/errors`
   ```typescript
   import { handleError } from '@/helpers/errors';
   
   try {
     await apiRequest.post('/users', data);
   } catch (error) {
     handleError(error, { toast: true });
   }
   ```

3. **Constants:** `@/constants/`
   ```typescript
   import { API_ENDPOINTS } from '@/constants/api';
   import { ROUTES } from '@/constants/routes';
   ```

### State Management

**Server State (SWR):**
```typescript
import useSWR from 'swr';

const { data, error, isLoading, mutate } = useSWR(
  '/users',
  () => apiRequest.get('/users')
);
```

**Client State (Zustand):**
```typescript
import { create } from 'zustand';

const useStore = create((set) => ({
  selectedUser: null,
  setSelectedUser: (user) => set({ selectedUser: user }),
}));
```

### Custom Hooks Pattern

Combine SWR + Zustand for data management:

```typescript
// hooks/useUsers.ts
export function useUsers(orgId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/users?orgId=${orgId}`,
    () => apiUsers.getUsers(orgId)
  );
  
  return {
    users: data?.users || [],
    total: data?.total || 0,
    isLoading,
    error,
    refresh: mutate,
  };
}
```

### Logging

**Use hackLog instead of console.log:**

```typescript
import { hackLog } from '@/helpers/logger';

// API requests
hackLog.apiRequest('GET', '/users', { orgId });

// State changes
hackLog.storeAction('setSelectedUser', { userId });

// Errors
hackLog.error('Failed to fetch users', { error });
```

### Component Guidelines

1. **Use TypeScript strict mode**
2. **Implement proper error boundaries**
3. **Add loading states with skeletons**
4. **Use toast notifications for feedback**
5. **Implement debouncing for search/filters (300ms)**
6. **Follow accessibility best practices**

### Performance Optimization

**Debouncing:**
```typescript
import { useDebounce } from '@/hooks/useDebounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);
```

**SWR Configuration:**
```typescript
// lib/swr-config.ts
export const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
};
```

**React Optimization:**
```typescript
import { memo, useMemo, useCallback } from 'react';

const Component = memo(({ data }) => {
  const processed = useMemo(() => processData(data), [data]);
  const handler = useCallback(() => handleClick(), []);
  
  return <div>{processed}</div>;
});
```

## Features

### User Management
- List, view, create, update, and delete users
- Manage organization memberships
- Role-based access control

### Organization Management
- Create and manage organizations
- View organization statistics
- Configure organization settings

### Group Management
- Create and manage groups
- Add/remove group members
- Control document access via groups

### Document Management
- Upload documents (PDF, DOCX, TXT)
- View document details and chunks
- Search and filter documents
- ACL-based access control

### Semantic Search
- Natural language search across documents
- Filter by file type, tags, date range
- View search history and suggestions
- Relevance scoring

### Admin Dashboard
- System statistics and analytics
- User activity monitoring
- System health status

## Styling

### Theme System

The application uses a theme system with predefined color schemes:

```typescript
// Current theme: edtech
const theme = {
  primary: 'blue',
  secondary: 'purple',
  accent: 'green',
};
```

### Tailwind CSS

Use Tailwind utility classes for styling:

```tsx
<div className="flex items-center gap-4 p-4 rounded-lg bg-white shadow-md">
  <h2 className="text-2xl font-bold text-gray-900">Title</h2>
</div>
```

### shadcn/ui Components

Use pre-built components from shadcn/ui:

```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
```

## Testing

```bash
# Run tests (when implemented)
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Deployment

### Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run start
```

### Environment Configuration

1. Copy production template:
   ```bash
   cp .env.production.template .env.production
   ```

2. Update values in `.env.production`:
   - Set `NEXT_PUBLIC_API_URL` to your production backend URL
   - Set `NODE_ENV=production`
   - Configure any feature flags

3. Build and deploy:
   ```bash
   npm run build
   ```

### Deployment Platforms

**Vercel (Recommended):**
```bash
npm install -g vercel
vercel
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

**Other Platforms:**
- Netlify
- AWS Amplify
- Railway
- Render

## Troubleshooting

### Common Issues

**1. API Connection Errors**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running
- Verify CORS configuration

**2. Build Errors**
- Clear `.next` directory: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

**3. Environment Variables Not Working**
- Restart dev server after changing `.env.local`
- Verify variable names start with `NEXT_PUBLIC_` for client-side access
- Check for typos in variable names

**4. Styling Issues**
- Clear Tailwind cache: `rm -rf .next`
- Verify Tailwind config is correct
- Check for conflicting CSS

## Documentation

- [Environment Variables](../ENVIRONMENT_VARIABLES.md) - Complete environment configuration guide
- [Backend API](../backend/README.md) - Backend setup and API documentation
- [Project Rules](./docs/rules.md) - Development guidelines and best practices

## Support

For issues or questions:
1. Check this documentation
2. Review [docs/rules.md](./docs/rules.md)
3. Check browser console for errors
4. Review backend logs
5. Contact the development team

## License

[Your License Here]
