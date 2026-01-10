# 🚀 Complete API Reference

## Base URL
- **Local**: `http://localhost:3000`
- **Production**: `https://your-vercel-domain.vercel.app`

## Authentication Endpoints

### 1. Login
**POST** `/api/auth/login`

Authenticate user with email and password. Returns user data and sets auth token cookie.

**Request Headers**
```
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Success Response (200)**
```json
{
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

**Cookie Set**
```
Set-Cookie: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/
```

**Error Responses**
- `400` - Missing email or password
- `401` - Invalid email or password
- `403` - User account is inactive
- `500` - Internal server error

**Example Usage**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

---

### 2. Logout
**POST** `/api/auth/logout`

Clear authentication token and end user session.

**Request Headers**
```
Cookie: auth_token=<token>
```

**Success Response (200)**
```json
{
  "message": "Logout successful"
}
```

**Cookie Cleared**
```
Set-Cookie: auth_token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/
```

**Example Usage**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b "auth_token=<your_token>"
```

---

### 3. Get Current User
**GET** `/api/auth/me`

Retrieve information about the currently authenticated user.

**Request Headers**
```
Cookie: auth_token=<token>
```

**Success Response (200)**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

**Error Responses**
- `401` - Unauthorized (no token or invalid token)
- `500` - Internal server error

**Example Usage**
```bash
curl http://localhost:3000/api/auth/me \
  -b "auth_token=<your_token>"
```

---

## Frontend Routes

### Public Routes (No Authentication Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/signin` | SignInForm | User login page |
| `/signup` | SignUpForm | User registration page (UI only) |
| `/` | Home | Dashboard home |

**Behavior**: Authenticated users are redirected to their dashboard

---

### Protected Routes (Authentication Required)

| Route | Role | Component | Description |
|-------|------|-----------|-------------|
| `/admin` | admin | Admin Dashboard | E-commerce metrics, charts, orders |
| `/member` | member | Member Dashboard | Sales metrics and recent orders |
| `/profile` | both | Profile Page | User profile and settings |

**Behavior**: Unauthenticated users are redirected to `/signin`

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role varchar(16) NOT NULL DEFAULT 'member',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login timestamptz
);
```

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique user identifier |
| `email` | TEXT | NOT NULL, UNIQUE | User's email address |
| `password_hash` | TEXT | NOT NULL | bcryptjs hashed password |
| `role` | VARCHAR(16) | NOT NULL, DEFAULT 'member' | User role: 'admin' or 'member' |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Account status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Account creation time |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last account update time |
| `last_login` | TIMESTAMPTZ | NULL | Timestamp of last successful login |

### Indexes

```sql
CREATE INDEX idx_users_email ON users(email);
```

---

## JWT Token

### Token Structure

```
Header.Payload.Signature
```

### Payload
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1704988800,
  "exp": 1705593600
}
```

### Token Properties
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 7 days (604800 seconds)
- **Secret**: `JWT_SECRET` environment variable
- **Issuer**: Not specified
- **Audience**: Not specified

---

## Environment Variables

### Required

| Variable | Format | Example | Purpose |
|----------|--------|---------|---------|
| `DATABASE_URL` | PostgreSQL URI | `postgresql://user:pass@host:5432/db?sslmode=require` | Database connection |
| `JWT_SECRET` | Random string (32+ chars) | `a1b2c3d4e5f6g7h8...` | JWT signing secret |

### Optional

| Variable | Default | Example | Purpose |
|----------|---------|---------|---------|
| `NODE_ENV` | `development` | `production` | Environment mode |
| `PGSSLMODE` | Depends on config | `require` | PostgreSQL SSL mode |

### Generate Strong JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Security Implementation

### Password Hashing
```typescript
// Using bcryptjs
import bcrypt from 'bcryptjs';

const hash = await bcrypt.hash(password, 10);
const isMatch = await bcrypt.compare(password, hash);
```

- **Algorithm**: bcryptjs
- **Salt Rounds**: 10
- **Time Complexity**: O(2^10) iterations

### JWT Signing
```typescript
import jwt from 'jsonwebtoken';

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
const verified = jwt.verify(token, JWT_SECRET);
```

### Cookie Security
```typescript
response.cookies.set('auth_token', token, {
  httpOnly: true,        // Not accessible via JavaScript
  secure: true,          // Only sent over HTTPS
  sameSite: 'lax',      // CSRF protection
  maxAge: 7 * 24 * 60 * 60, // 7 days
  path: '/'             // Available to all paths
});
```

---

## Common API Workflows

### Complete Login Flow

```javascript
// 1. User submits credentials
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

// 2. Cookie is automatically set
const data = await response.json();

// 3. Check role and redirect
if (data.user.role === 'admin') {
  window.location.href = '/admin';
} else {
  window.location.href = '/member';
}

// 4. Subsequent requests include cookie automatically
const userResponse = await fetch('/api/auth/me');
const currentUser = await userResponse.json();
```

### Complete Logout Flow

```javascript
// 1. User clicks logout
await fetch('/api/auth/logout', { method: 'POST' });

// 2. Cookie is cleared automatically

// 3. Redirect to login
window.location.href = '/signin';
```

### Check Authentication Status

```javascript
// From client component
async function checkAuth() {
  try {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
      const { user } = await response.json();
      return { authenticated: true, user };
    }
  } catch (error) {
    // Not authenticated
  }
  return { authenticated: false, user: null };
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": "Error message describing the problem"
}
```

### Common Errors

| Status | Error | Cause | Solution |
|--------|-------|-------|----------|
| 400 | Missing email or password | Incomplete form submission | Validate form before submit |
| 401 | Invalid email or password | Wrong credentials | Check email/password |
| 401 | Unauthorized | No token provided | Login first |
| 401 | Invalid or expired token | Token expired or invalid | Login again |
| 403 | User account is inactive | Account disabled | Contact admin |
| 500 | Internal server error | Server-side error | Check logs, retry |

---

## Rate Limiting Recommendations

Implement these on production:

```javascript
// Suggested rate limits
- Login endpoint: 5 attempts per 15 minutes per IP
- Logout endpoint: No limit (safe operation)
- Get user endpoint: No limit (read-only)
```

---

## Testing with cURL

### Login Test
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  -i
```

### Get User Test (with cookie)
```bash
curl http://localhost:3000/api/auth/me \
  -H "Cookie: auth_token=<token>" \
  -i
```

### Logout Test
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -i
```

---

## Testing with JavaScript/Fetch

### Create Auth Helper
```javascript
// lib/api.ts
export async function login(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch('/api/auth/me');
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
}
```

---

## Performance Considerations

### Database Queries
- **Login**: 2 queries (select user, update last_login)
- **Get User**: 0 queries (token validation only)
- **Logout**: 0 queries (cookie clearing)

### Token Verification
- **Time**: < 1ms (cryptographic verify)
- **Overhead**: Minimal server-side cost

### Recommended Optimizations
1. Add database query caching for user lookups
2. Implement rate limiting on login endpoint
3. Use CDN for static files
4. Monitor database connection pool

---

## Monitoring & Logging

### Key Metrics to Track
- Failed login attempts
- Token validation failures
- Database connection errors
- Average response times
- User sessions duration

### Logs to Check
```javascript
// Enable request logging
console.log('Executed query', { text, duration, rows });
console.log('Login error:', error);
console.log('Auth check error:', error);
```

---

## Migrating Existing Users

If you have existing users, import them:

```sql
INSERT INTO users (email, password_hash, role, created_at)
SELECT 
  email,
  password_hash,  -- Must be bcryptjs hashed
  'member' as role,
  NOW() as created_at
FROM old_users_table
WHERE email NOT IN (SELECT email FROM users);
```

---

## Support & Resources

- **Local Setup**: `QUICKSTART.md`
- **Detailed Docs**: `AUTH_SETUP.md`
- **Deployment**: `DEPLOYMENT_CHECKLIST.md`
- **Architecture**: `IMPLEMENTATION_SUMMARY.md`

**Last Updated**: January 2026
