# Access Control Guards

This directory contains guards for authentication and authorization in the VaultScout application.

## Available Guards

### 1. AuthGuard

**Purpose:** Validates Supabase JWT tokens and attaches user information to the request.

**Usage:**
```typescript
import { AuthGuard, CurrentUser } from '../../common';

@Controller('users')
export class UsersController {
  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return { id: user.id, email: user.email };
  }
}
```

**What it does:**
- Extracts JWT token from Authorization header or cookies
- Validates token with Supabase Auth
- Creates local user record if doesn't exist
- Attaches user object to request: `{ id, email, supabaseUser }`

**Throws:**
- `UnauthorizedException` - No token provided or invalid token

---

### 2. RoleGuard

**Purpose:** Checks if user has required role in the organization.

**Usage:**
```typescript
import { AuthGuard, RoleGuard, Roles } from '../../common';

@Controller('users')
export class UsersController {
  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('admin')
  async deleteUser(
    @Param('id') id: string,
    @Query('orgId') orgId: string
  ) {
    // Only admins can delete users
  }

  @Put(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('admin', 'editor')
  async updateUser(
    @Param('id') id: string,
    @Query('orgId') orgId: string,
    @Body() dto: UpdateUserDto
  ) {
    // Admins and editors can update users
  }
}
```

**What it does:**
- Requires `@Roles()` decorator to specify allowed roles
- Extracts `orgId` from request params or query
- Queries `user_organizations` table to get user's role
- Checks if user's role matches any of the required roles
- Attaches `orgId` and `userRole` to request

**Available Roles:**
- `admin` - Full access to organization resources
- `editor` - Can create and modify resources
- `viewer` - Read-only access

**Throws:**
- `ForbiddenException` - User not in organization or insufficient role
- `BadRequestException` - Missing orgId parameter

**Requirements:**
- Must be used with `AuthGuard`
- Requires `orgId` in params or query
- Requires `@Roles()` decorator

---

### 3. ACLGuard

**Purpose:** Checks if user has access to a document based on ACL groups.

**Usage:**
```typescript
import { AuthGuard, ACLGuard } from '../../common';

@Controller('documents')
export class DocumentsController {
  @Get(':id')
  @UseGuards(AuthGuard, ACLGuard)
  async getDocument(@Param('id') id: string) {
    // Only users in document's ACL groups can access
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard, ACLGuard)
  @Roles('admin', 'editor')
  async deleteDocument(
    @Param('id') id: string,
    @Query('orgId') orgId: string
  ) {
    // Must be admin/editor AND have ACL access
  }
}
```

**What it does:**
- Extracts `documentId` from request params (`:id` or `:documentId`)
- Checks if document exists
- Gets all groups user belongs to
- Checks if any of user's groups are in document's ACL
- Attaches `document` object to request

**Throws:**
- `NotFoundException` - Document not found
- `ForbiddenException` - User not in any of document's ACL groups
- `BadRequestException` - Missing document ID parameter

**Requirements:**
- Must be used with `AuthGuard`
- Requires `id` or `documentId` in params
- User must belong to at least one group in document's ACL

---

## Guard Combinations

### Authentication Only
```typescript
@Get('profile')
@UseGuards(AuthGuard)
async getProfile(@CurrentUser() user: any) {
  // Any authenticated user can access
}
```

### Authentication + Role
```typescript
@Delete(':id')
@UseGuards(AuthGuard, RoleGuard)
@Roles('admin')
async deleteUser(
  @Param('id') id: string,
  @Query('orgId') orgId: string
) {
  // Only admins in the organization can access
}
```

### Authentication + ACL
```typescript
@Get(':id')
@UseGuards(AuthGuard, ACLGuard)
async getDocument(@Param('id') id: string) {
  // Only users with ACL access can view document
}
```

### Authentication + Role + ACL
```typescript
@Put(':id')
@UseGuards(AuthGuard, RoleGuard, ACLGuard)
@Roles('admin', 'editor')
async updateDocument(
  @Param('id') id: string,
  @Query('orgId') orgId: string,
  @Body() dto: UpdateDocumentDto
) {
  // Must be admin/editor AND have ACL access
}
```

---

## Request Object Extensions

After guards execute successfully, they attach additional data to the request:

### AuthGuard
```typescript
request.user = {
  id: string;           // Local user ID (UUID)
  email: string;        // User email
  supabaseUser: any;    // Full Supabase user object
};
```

### RoleGuard
```typescript
request.orgId = string;      // Organization ID
request.userRole = string;   // User's role in organization
```

### ACLGuard
```typescript
request.document = {
  id: string;
  orgId: string;
  title: string;
  // ... other document fields
};
```

---

## Error Handling

All guards follow consistent error handling:

1. **Detailed Logging:** All operations logged with full context
2. **Specific Exceptions:** Use appropriate NestJS exceptions
3. **User-Friendly Messages:** Clear error messages for clients
4. **Development Stack Traces:** Stack traces only in development mode

Example error responses:

```json
// 401 Unauthorized (AuthGuard)
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "error": "Unauthorized"
}

// 403 Forbidden (RoleGuard)
{
  "statusCode": 403,
  "message": "Insufficient permissions. Required roles: admin. Your role: viewer",
  "error": "Forbidden"
}

// 403 Forbidden (ACLGuard)
{
  "statusCode": 403,
  "message": "You do not have access to this document",
  "error": "Forbidden"
}

// 404 Not Found (ACLGuard)
{
  "statusCode": 404,
  "message": "Document not found",
  "error": "Not Found"
}
```

---

## Best Practices

1. **Always use AuthGuard first:** Other guards depend on authenticated user
   ```typescript
   @UseGuards(AuthGuard, RoleGuard, ACLGuard) // ✅ Correct order
   @UseGuards(RoleGuard, AuthGuard, ACLGuard) // ❌ Wrong order
   ```

2. **Provide orgId for RoleGuard:** Include in params or query
   ```typescript
   // ✅ Good - orgId in query
   @Get('users')
   @UseGuards(AuthGuard, RoleGuard)
   @Roles('admin')
   async getUsers(@Query('orgId') orgId: string) {}

   // ✅ Good - orgId in params
   @Get('organizations/:orgId/users')
   @UseGuards(AuthGuard, RoleGuard)
   @Roles('admin')
   async getOrgUsers(@Param('orgId') orgId: string) {}
   ```

3. **Use @Roles decorator with RoleGuard:** Always specify required roles
   ```typescript
   @UseGuards(AuthGuard, RoleGuard)
   @Roles('admin') // ✅ Required
   async deleteUser() {}
   ```

4. **Combine guards for fine-grained control:** Use multiple guards when needed
   ```typescript
   @UseGuards(AuthGuard, RoleGuard, ACLGuard)
   @Roles('admin', 'editor')
   async updateDocument() {
     // User must be admin/editor AND have ACL access
   }
   ```

5. **Use CurrentUser decorator:** Extract user info from request
   ```typescript
   @UseGuards(AuthGuard)
   async getProfile(@CurrentUser() user: any) {
     // Access user.id, user.email
   }

   @UseGuards(AuthGuard)
   async getProfile(@CurrentUser('id') userId: string) {
     // Access just the ID
   }
   ```

---

## Testing Guards

### Unit Testing
```typescript
describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Reflector;
  let db: DatabaseService;

  beforeEach(() => {
    reflector = new Reflector();
    db = mockDatabaseService();
    guard = new RoleGuard(reflector, db);
  });

  it('should allow access for admin role', async () => {
    // Mock reflector to return ['admin']
    // Mock db to return user with admin role
    // Assert canActivate returns true
  });

  it('should deny access for insufficient role', async () => {
    // Mock reflector to return ['admin']
    // Mock db to return user with viewer role
    // Assert canActivate throws ForbiddenException
  });
});
```

### Integration Testing
```typescript
describe('DocumentsController (e2e)', () => {
  it('should deny access without authentication', () => {
    return request(app.getHttpServer())
      .get('/documents/123')
      .expect(401);
  });

  it('should deny access without ACL permission', () => {
    return request(app.getHttpServer())
      .get('/documents/123')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('should allow access with ACL permission', () => {
    return request(app.getHttpServer())
      .get('/documents/123')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});
```

---

## Database Schema Reference

### user_organizations
```sql
CREATE TABLE user_organizations (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role role_enum NOT NULL, -- 'admin', 'editor', 'viewer'
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, org_id)
);
```

### user_groups
```sql
CREATE TABLE user_groups (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, group_id)
);
```

### document_acl_groups
```sql
CREATE TABLE document_acl_groups (
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, group_id)
);
```

---

## Performance Considerations

1. **Database Queries:** Each guard makes 1-2 database queries
   - RoleGuard: 1 query to user_organizations
   - ACLGuard: 2-3 queries (document, user_groups, document_acl_groups)

2. **Caching:** Consider caching user roles and group memberships for high-traffic endpoints

3. **Query Optimization:** All queries use indexed columns (primary keys, foreign keys)

4. **Logging Overhead:** Detailed logging adds minimal overhead (~1-2ms per request)

---

## Migration Guide

### Before (No Guards)
```typescript
@Controller('documents')
export class DocumentsController {
  @Get(':id')
  async getDocument(@Param('id') id: string) {
    // No access control
  }
}
```

### After (With Guards)
```typescript
@Controller('documents')
export class DocumentsController {
  @Get(':id')
  @UseGuards(AuthGuard, ACLGuard)
  async getDocument(@Param('id') id: string) {
    // Protected by authentication and ACL
  }
}
```

---

## Troubleshooting

### "User not found in request"
- **Cause:** RoleGuard or ACLGuard used without AuthGuard
- **Solution:** Add AuthGuard before other guards
  ```typescript
  @UseGuards(AuthGuard, RoleGuard) // ✅ Correct
  ```

### "Organization ID is required"
- **Cause:** RoleGuard can't find orgId in params or query
- **Solution:** Add orgId to route params or query
  ```typescript
  @Get('users')
  async getUsers(@Query('orgId') orgId: string) {} // ✅ Correct
  ```

### "Document ID is required"
- **Cause:** ACLGuard can't find document ID in params
- **Solution:** Use :id or :documentId in route
  ```typescript
  @Get(':id') // ✅ Correct
  async getDocument(@Param('id') id: string) {}
  ```

### "Roles decorator is required"
- **Cause:** RoleGuard used without @Roles decorator
- **Solution:** Add @Roles decorator
  ```typescript
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('admin') // ✅ Required
  async deleteUser() {}
  ```
