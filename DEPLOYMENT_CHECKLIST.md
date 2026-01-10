# Deployment Checklist

## Pre-Deployment ✓

- [x] Backend authentication implemented
- [x] JWT token system created
- [x] Database schema scripts ready
- [x] Middleware route protection added
- [x] Login form integrated
- [x] User dropdown updated
- [x] Admin dashboard created
- [x] Member dashboard created
- [x] Build passes successfully
- [x] TypeScript compilation successful

## Local Testing (Before Deployment)

- [ ] Start dev server: `npm run dev`
- [ ] Visit http://localhost:3000/signin
- [ ] Try to access /admin (should redirect to signin)
- [ ] Create a test user in database
- [ ] Login with test credentials
- [ ] Verify correct role redirects to correct dashboard
- [ ] Test logout functionality
- [ ] Verify user info shows in dropdown

## Deployment Steps

### Step 1: Prepare Environment (5 min)
- [ ] Set `DATABASE_URL` environment variable
  - Copy from Neon database connection string
  - Format: `postgresql://user:password@host:port/database?sslmode=require`
- [ ] Generate and set `JWT_SECRET`
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### Step 2: Create Database Schema (2 min)
Option A - Run locally then push:
```bash
npx tsx scripts/migrate.ts
git add .
git commit -m "db: add users table"
```

Option B - Run on Vercel after deployment:
- Deploy first
- Use Vercel CLI or create a one-time task in deployment logs

### Step 3: Push to Vercel (5 min)
```bash
git push origin main
```

The build should automatically:
- Install dependencies
- Run TypeScript check
- Build Next.js optimized production bundle
- Deploy to your domain

### Step 4: Verify Deployment (5 min)
- [ ] Visit your Vercel domain
- [ ] Navigate to `/signin`
- [ ] Verify login works
- [ ] Seed test users: `node scripts/seed.js`
- [ ] Login with test account
- [ ] Verify dashboard loads
- [ ] Check user dropdown shows correct role

## Vercel Setup

### Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add:
```
DATABASE_URL = your-neon-database-url
JWT_SECRET = your-generated-secret
NODE_ENV = production
```

### Domains
- [ ] Configure custom domain (if applicable)
- [ ] SSL certificate auto-provisioned by Vercel
- [ ] DNS records updated

## Database Setup

### Neon Configuration
- [ ] Database created and running
- [ ] Connection URL copied to DATABASE_URL
- [ ] Password and username stored securely
- [ ] Database accepts external connections
- [ ] Vercel IP is whitelisted (if using network restrictions)

### Initial Data
- [ ] Run migration: `npx tsx scripts/migrate.ts`
- [ ] Create admin user: `node scripts/seed.js`
- [ ] Or insert test users manually via Neon console

## Post-Deployment Testing

### Functional Tests
- [ ] Signin page loads
- [ ] Login with valid credentials works
- [ ] Invalid credentials show error message
- [ ] Successful login redirects to dashboard
- [ ] Admin role redirects to `/admin`
- [ ] Member role redirects to `/member`
- [ ] User info displays in header dropdown
- [ ] Logout clears cookies and redirects to signin
- [ ] Protected routes redirect unauthenticated users to signin
- [ ] Member can't access admin-only features

### Security Tests
- [ ] Tokens stored in HttpOnly cookies (check browser DevTools)
- [ ] HTTPS is enforced (green lock icon)
- [ ] Expired tokens trigger re-authentication
- [ ] JWT is verified server-side
- [ ] Passwords are hashed (not plaintext in DB)

### Database Tests
- [ ] Connection to Neon succeeds
- [ ] Users table exists and has data
- [ ] Queries execute without errors
- [ ] Last login updates on login

## Monitoring (Post-Deployment)

### Logs to Monitor
- [ ] Vercel build logs for errors
- [ ] Runtime logs for API errors
- [ ] Database connection errors
- [ ] JWT validation failures

### Check These
```bash
# Check Vercel logs
vercel logs --tail

# Check database connection
curl https://your-domain.vercel.app/api/auth/me

# Test login endpoint
curl -X POST https://your-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Troubleshooting During Deployment

### "DATABASE_URL is not set" Error
- [ ] Check Vercel environment variables are saved
- [ ] Verify DATABASE_URL format is correct
- [ ] Redeploy after changing env vars

### "Can't connect to database" Error
- [ ] Verify DATABASE_URL is accessible from Vercel
- [ ] Check Neon database is running
- [ ] Verify sslmode=require in connection string
- [ ] Test connection locally first

### "Invalid JWT Secret" Error
- [ ] Ensure JWT_SECRET is set in Vercel
- [ ] Regenerate and update JWT_SECRET
- [ ] All users will need to login again

### Build Fails Error
- [ ] Check build logs in Vercel
- [ ] Verify TypeScript compiles locally
- [ ] Check for missing environment variables
- [ ] Review middleware configuration

## Rollback Plan

If something goes wrong:

### Quick Rollback
```bash
git revert <commit-hash>
git push origin main
# Vercel auto-redeploys
```

### Manual Rollback
- Go to Vercel Dashboard
- Project → Deployments
- Find previous working deployment
- Click "Redeploy"

## Post-Deployment Improvements

- [ ] Create admin user management panel
- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add login attempt rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Add analytics tracking
- [ ] Create backup strategy for database
- [ ] Set up database auto-backups (Neon has this)

## Security Checklist

- [ ] JWT_SECRET is strong (32+ chars, random)
- [ ] DATABASE_URL password is strong
- [ ] No secrets in `.env.local` committed to git
- [ ] .env.local is in .gitignore
- [ ] HTTPS enabled on Vercel
- [ ] HttpOnly cookies enabled
- [ ] Rate limiting considered for login endpoint
- [ ] SQL injection protection (using parameterized queries)
- [ ] CSRF protection enabled (SameSite cookies)

## Final Sign-Off

When all checks complete:

- [ ] Development team tested locally
- [ ] Staging deployment verified
- [ ] Production deployment successful
- [ ] End-to-end tests passed
- [ ] Performance acceptable
- [ ] Error monitoring configured
- [ ] Backup strategy implemented
- [ ] Documentation complete

**Status**: 🚀 Ready for Production

---

**Date**: January 2026
**Deployed By**: [Your Name]
**Version**: 1.0.0
