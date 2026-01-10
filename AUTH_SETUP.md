# Backend Authentication Setup Guide

This guide explains the authentication system added to your project.

## Overview

A simple JWT-based authentication system with two roles: **admin** and **member**. Both roles have access to a dashboard upon login.

## Features

- ✓ Email/password login
- ✓ Two roles: admin and member
- ✓ Dashboard redirect based on role
- ✓ HttpOnly secure cookies
- ✓ Protected routes via middleware
- ✓ Logout functionality
- ✓ User info endpoint

## Installation & Setup

### 1. Environment Variables

Add these to your `.env.local` file:

```env
# Database
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-key-change-in-production-12345
```

You can generate a strong JWT_SECRET with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Create Database Schema

Run the migration script to create the `users` table:

```bash
npm install -D tsx
npx tsx scripts/migrate.ts
```

This creates:
- `users` table with columns: id, email, password_hash, role, is_active, created_at, updated_at, last_login
- Index on email for faster lookups

### 3. Seed Initial Users

Create test users (optional):

```bash
node scripts/seed.js
```

This creates:
- **Admin**: `admin@example.com` / `admin123`
- **Member**: `member@example.com` / `member123`

### 4. Deploy to Vercel

Add environment variables to your Vercel project:
1. Go to your project settings → Environment Variables
2. Add `DATABASE_URL` and `JWT_SECRET`
3. Deploy

## File Structure

```
src/
├── app/
│   ├── api/auth/
│   │   ├── login/route.ts       # POST /api/auth/login
│   │   ├── logout/route.ts      # POST /api/auth/logout
│   │   └── me/route.ts          # GET /api/auth/me
│   ├── (admin)/
│   │   ├── page.tsx             # Admin dashboard
│   │   └── layout.tsx
│   └── member/
│       ├── page.tsx             # Member dashboard
│       └── layout.tsx
├── lib/
│   ├── auth.ts                  # Password hashing/verification
│   ├── db.ts                    # Database client
│   └── jwt.ts                   # JWT signing/verification
├── components/auth/
│   └── SignInForm.tsx           # Login form (updated)
└── middleware.ts                # Route protection
```

## API Endpoints

### POST /api/auth/login

Login with email and password.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

Sets `auth_token` HttpOnly cookie automatically.

### POST /api/auth/logout

Logout and clear the auth token.

**Response:**
```json
{
  "message": "Logout successful"
}
```

### GET /api/auth/me

Get current logged-in user info.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

## Route Protection

The middleware (`src/middleware.ts`) automatically protects routes:

- **Public routes**: `/signin`, `/signup`, `/` (unauthenticated users only)
- **Admin routes**: `/admin` (requires admin role)
- **Member routes**: `/member` (requires member role)
- **Redirect logic**:
  - Unauthenticated → redirects to `/signin`
  - Logged-in users on `/signin` → redirects to dashboard (admin or member)
  - Member accessing admin → redirects to `/member`

## Frontend Integration

### Login Form

The `SignInForm` component now:
- Calls `POST /api/auth/login`
- Handles validation and errors
- Redirects to `/admin` or `/member` based on role

### User Dropdown

The `UserDropdown` component now:
- Displays logged-in user email and role
- Handles logout via `POST /api/auth/logout`

## Security Notes

1. **Passwords**: Hashed with bcryptjs (10 rounds)
2. **JWT**: Expires in 7 days, verified server-side
3. **Cookies**: HttpOnly, Secure (in production), SameSite=Lax
4. **HTTPS**: Required in production (automatic with Vercel)

## Creating New Users

### Via Script

Create a new script file `scripts/create-user.js`:

```javascript
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function createUser(email, password, role = 'member') {
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
      [email, hash, role]
    );
    console.log('User created:', result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

createUser(process.argv[2], process.argv[3], process.argv[4]);
```

Run:
```bash
DATABASE_URL="your-url" node scripts/create-user.js newuser@example.com password123 member
```

### Via API (Create a protected endpoint)

Add `src/app/api/users/route.ts` for admin-only user creation:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { email, password, role } = await request.json();
  const passwordHash = await hashPassword(password);

  try {
    const result = await query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, passwordHash, role || 'member']
    );

    return NextResponse.json(
      { user: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }
}
```

## Troubleshooting

### "Connection refused" error
- Check `DATABASE_URL` is correct
- Verify Neon database is active and accessible from Vercel IP

### "Invalid or expired token"
- JWT expires in 7 days
- Clear cookies and login again
- Check `JWT_SECRET` matches between local and Vercel

### "User not found" on login
- Ensure database migration ran: `npx tsx scripts/migrate.ts`
- Check if user exists: `SELECT * FROM users WHERE email='...';`
- Seed test users: `node scripts/seed.js`

## Next Steps

1. Customize the dashboard (replace ecommerce components if needed)
2. Add "Forgot Password" functionality
3. Add email verification on signup
4. Implement refresh tokens for better security
5. Add role-based permission system for fine-grained access control
