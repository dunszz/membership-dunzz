# Quick Start Guide - Backend Authentication

## What's Been Implemented ✅

Your project now has a complete authentication system with:

- ✅ JWT-based login system
- ✅ Two roles: **admin** and **member**
- ✅ Protected dashboards for both roles
- ✅ Secure HttpOnly cookies
- ✅ Database integration with Neon (PostgreSQL)
- ✅ Logout functionality
- ✅ Updated user dropdown showing current user

## Files Added/Modified

### New Files
```
src/
├── app/
│   ├── api/auth/login/route.ts         # Login endpoint
│   ├── api/auth/logout/route.ts        # Logout endpoint
│   ├── api/auth/me/route.ts            # Get current user
│   └── member/
│       ├── page.tsx                    # Member dashboard
│       └── layout.tsx                  # Member layout
├── lib/
│   ├── auth.ts                         # Password hashing
│   ├── db.ts                           # Database client
│   └── jwt.ts                          # JWT utilities
└── middleware.ts                       # Route protection
scripts/
├── migrate.ts                          # Create database schema
└── seed.js                             # Seed test users
AUTH_SETUP.md                           # Full setup guide
```

### Modified Files
```
src/components/auth/SignInForm.tsx      # Added login logic
src/components/header/UserDropdown.tsx  # Added logout & user display
```

## Step 1: Set Up Environment Variables

Create or update `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
JWT_SECRET=generate-a-strong-secret-key-here
```

Generate a secure JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 2: Create Database Schema

Run the migration script to create the `users` table:

```bash
npm install -D tsx
npx tsx scripts/migrate.ts
```

## Step 3: Seed Test Users (Optional)

Create admin and member test accounts:

```bash
node scripts/seed.js
```

Test credentials:
- **Admin**: `admin@example.com` / `admin123`
- **Member**: `member@example.com` / `member123`

## Step 4: Test Locally

```bash
npm run dev
```

Then visit: http://localhost:3000/signin

- Login with `admin@example.com` → redirects to `/admin`
- Login with `member@example.com` → redirects to `/member`

## Step 5: Deploy to Vercel

1. Add environment variables to Vercel project:
   - Go to Settings → Environment Variables
   - Add `DATABASE_URL` and `JWT_SECRET`

2. Deploy:
   ```bash
   git push origin main
   ```

3. Run migration on Vercel (via build log terminal or locally then push)

## Testing the API

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Get Current User
```bash
curl http://localhost:3000/api/auth/me \
  -H "Cookie: auth_token=your_token_here"
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout
```

## Route Access

| Route | Public | Admin | Member | Redirect |
|-------|--------|-------|--------|----------|
| `/signin` | ✅ | → `/admin` | → `/member` | Redirects if logged in |
| `/signup` | ✅ | → `/admin` | → `/member` | Redirects if logged in |
| `/admin` | ❌ | ✅ | → `/member` | Requires admin role |
| `/member` | ❌ | ✅ | ✅ | Requires auth |
| `/` | ✅ | ✅ | ✅ | Public |

## User Dashboard Pages

- **Admin Dashboard**: `/admin` (uses ecommerce metrics, charts, orders)
- **Member Dashboard**: `/member` (simplified view of metrics and orders)

## Common Issues & Solutions

### "DATABASE_URL is not set"
- Make sure `.env.local` has `DATABASE_URL`
- Restart dev server after adding env vars

### "Can't connect to database"
- Verify DATABASE_URL is correct
- Check Neon database is running
- Ensure IP whitelisting allows your machine

### Login fails with "Invalid email or password"
- Run seed script: `node scripts/seed.js`
- Or create a user manually (see AUTH_SETUP.md)

### Token validation errors
- Ensure `JWT_SECRET` matches locally and on Vercel
- Check token hasn't expired (7 days)
- Clear browser cookies and login again

## Next Steps

1. **Customize dashboards**: Modify `/src/app/(admin)/page.tsx` and `/src/app/member/page.tsx`
2. **Add signup**: Implement user registration in `POST /api/auth/signup`
3. **Add password reset**: Create `/api/auth/reset-password` endpoint
4. **Email verification**: Add email confirmation on signup
5. **Role management**: Create admin panel to manage users and roles

## Additional Resources

- Full setup guide: See `AUTH_SETUP.md`
- API documentation: See `AUTH_SETUP.md` → "API Endpoints"
- Database schema: See `AUTH_SETUP.md` → "Creating New Users"

## Support

For detailed information, configuration options, and troubleshooting, see the full `AUTH_SETUP.md` file in the project root.
