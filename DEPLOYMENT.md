# 🚀 Deployment Guide - Evaconfecciones SaaS

## Pre-Deployment Checklist

### ✅ 1. Environment Variables

**Production `.env` file** (DO NOT commit to Git):
```bash
# Database (Supabase Production)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Optional: Direct connection for migrations
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

**Vercel Environment Variables** (set in dashboard):
- `DATABASE_URL` - Your production Supabase connection string
- `DIRECT_URL` - (Optional) Direct connection for Prisma migrations

---

### ✅ 2. Database Setup

**Run migrations on production database:**
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to production (first time)
npx prisma db push

# OR run migrations (recommended for production)
npx prisma migrate deploy
```

**Seed production database** (optional, for initial data):
```bash
npm run db:seed
```

---

### ✅ 3. Build Test

**Test production build locally:**
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Test production build
npm start
```

**Check for:**
- ✅ No TypeScript errors
- ✅ No build warnings
- ✅ All pages load correctly
- ✅ Database connections work
- ✅ All features functional

---

### ✅ 4. Code Quality

**Run linter:**
```bash
npm run lint
```

**Fix any issues before deploying.**

---

### ✅ 5. Security Review

**Check that `.gitignore` includes:**
- ✅ `.env` files
- ✅ `node_modules/`
- ✅ `.next/` build folder
- ✅ Any sensitive data

**Verify no secrets in code:**
```bash
# Search for potential secrets
grep -r "password" src/
grep -r "secret" src/
grep -r "api_key" src/
```

---

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

**Steps:**

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial production deployment"
   git remote add origin [YOUR-REPO-URL]
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure project:
     - Framework: Next.js
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Add Environment Variables:**
   - In Vercel dashboard → Settings → Environment Variables
   - Add `DATABASE_URL` with your Supabase production URL
   - Add `DIRECT_URL` (optional)

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Test your production URL

**Auto-deployments:**
- Every push to `main` branch will auto-deploy
- Preview deployments for pull requests

---

### Option 2: Docker + VPS

**Create `Dockerfile`:**
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Deploy:**
```bash
docker build -t evaconfecciones-saas .
docker run -p 3000:3000 --env-file .env evaconfecciones-saas
```

---

## Post-Deployment Verification

### ✅ Smoke Tests

1. **Homepage loads** → `/`
2. **Dashboard loads** → `/dashboard`
3. **Pedidos page** → `/pedidos`
   - Can view pedidos
   - Can create new pedido
   - Can edit pedido details
   - Can mark as delivered
4. **Administración** → `/administracion`
   - Can manage colegios
   - Can manage prendas
   - Can manage tallas
   - Can manage precios

### ✅ Performance Check

- Lighthouse score > 90
- First Contentful Paint < 2s
- Time to Interactive < 3s

### ✅ Database Check

- All queries working
- No connection pool errors
- Migrations applied correctly

---

## Monitoring & Maintenance

### Recommended Tools

1. **Vercel Analytics** - Built-in performance monitoring
2. **Sentry** - Error tracking (optional)
3. **Supabase Dashboard** - Database monitoring
4. **Uptime Robot** - Uptime monitoring (free)

### Regular Maintenance

- **Weekly:** Check error logs
- **Monthly:** Review performance metrics
- **Quarterly:** Database backup verification
- **As needed:** Security updates (`npm audit`)

---

## Rollback Plan

**If deployment fails:**

1. **Vercel:** Instant rollback to previous deployment
   - Go to Deployments → Select previous → Promote to Production

2. **Database:** Restore from backup
   ```bash
   # Supabase has automatic backups
   # Restore from Supabase dashboard
   ```

---

## Environment-Specific Notes

### Development
- Local PostgreSQL or Supabase dev project
- Hot reload enabled
- Debug logging on

### Production
- Supabase production database
- Optimized builds
- Error logging only
- Connection pooling enabled

---

## Support & Troubleshooting

### Common Issues

**Build fails:**
- Check TypeScript errors: `npm run build`
- Verify all dependencies installed: `npm install`

**Database connection fails:**
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Verify IP whitelist (if applicable)

**Pages not loading:**
- Check Vercel function logs
- Verify all environment variables set
- Check browser console for errors

---

## Security Best Practices

✅ **Never commit:**
- `.env` files
- API keys
- Database passwords
- Private keys

✅ **Always:**
- Use environment variables
- Keep dependencies updated
- Review security advisories
- Enable HTTPS (automatic on Vercel)
- Use strong database passwords

---

## Next Steps After Deployment

1. **Set up custom domain** (optional)
2. **Configure email notifications** (future feature)
3. **Set up automated backups**
4. **Create user documentation**
5. **Train end users**

---

**🎉 Your application is production-ready!**

For questions or issues, refer to:
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
