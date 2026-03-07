# Troubleshooting Guide

This document lists common issues encountered during development and deployment, along with their solutions.

---

## 🏗 Build & Deployment (Vercel)

### Symptom: `Failed to compile` during TypeScript run
**Issue**: Next.js attempts to type-check test files (Vitest/Playwright) during the production build.
**Solution**: Ensure `tsconfig.json` explicitly excludes the `tests/` and `scripts/` directories.
```json
"exclude": ["node_modules", "tests", "scripts"]
```

### Symptom: 500 Error on Database Query
**Issue**: `DATABASE_URL` is missing or the Prisma client is out of sync.
**Solution**:
1. Check that `DATABASE_URL` is set in the Vercel dashboard.
2. Ensure `npx prisma generate` is part of your build command.

---

## 🗄 Database (Prisma)

### Symptom: `PrismaClientInitializationError`
**Issue**: Usually an invalid connection string or network restriction (e.g., Supabase IP allowlist).
**Solution**: Verify the `DATABASE_URL` in `.env`. Ensure it uses the connection pooling URL if deploying to serverless.

### Symptom: Drift between Schema and DB
**Issue**: Manual changes made to the database without a migration.
**Solution**: Run `npx prisma db pull` to sync the schema, or `npx prisma migrate dev` to reset the local env to match the schema.

---

## 🧪 Testing

### Symptom: Tests wipe production data
**Issue**: Testing environment pointing to the primary `DATABASE_URL`.
**Solution**: Always use a separate `.env.test` file. The project includes a safety guard in `tests/helpers/db.ts` that blocks execution if it detects a Supabase/AWS production URL.

### Symptom: Playwright tests fail via Auth
**Issue**: `ADMIN_PASSWORD` in the test environment does not match the dashboard.
**Solution**: Check that `ADMIN_PASSWORD` is correctly defined in your local `.env` and that `admin-auth.ts` is consuming it correctly.

---

## 🔄 Cache & UI

### Symptom: Updated item doesn't show in the Menu
**Issue**: Next.js Data Cache is serving a stale version.
**Solution**: 
1. Perform a hard-refresh (Cmd+Shift+R).
2. Ensure the API handler successfully triggered `revalidatePath('/menu')`.
3. Clear the cache manually in the Vercel dashboard (Function settings).
