# Troubleshooting Guide

This document lists common issues encountered during development and deployment, along with their solutions.

---

## 🏗 Build & Deployment (Vercel)

### Symptom: `Failed to compile` — Unused `@ts-expect-error` directive
**Issue**: The `@ts-expect-error` suppression comments are marked as errors when the TypeScript compiler finds no error to suppress. This happens because Prisma types are correctly generated in the Vercel build environment.
**Solution**: Run `npx prisma generate` locally to regenerate Prisma client types, then remove the `@ts-expect-error` comments. The Prisma types will be correct and no suppression is needed.

### Symptom: `Failed to compile` during TypeScript run
**Issue**: Next.js attempts to type-check test files (Vitest/Playwright) during the production build.
**Solution**: Ensure `tsconfig.json` explicitly excludes the `tests/` and `scripts/` directories:
```json
"exclude": ["node_modules", "tests", "scripts"]
```

### Symptom: `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.`
**Issue**: In Next.js 16.2.3, the middleware convention has been replaced by the `proxy` convention.
**Solution**: Ensure the file is named `src/proxy.ts` and exports a function named `proxy`.

### Symptom: 500 Error on Database Query
**Issue**: `DATABASE_URL` is missing or the Prisma client is out of sync.
**Solution**:
1. Check that `DATABASE_URL` is set in Vercel dashboard under Settings → Environment Variables.
2. Ensure `npx prisma generate` runs as part of the build command (`prisma generate && next build`).

---

## 🗄 Database (Prisma)

### Symptom: `PrismaClientInitializationError`
**Issue**: Invalid connection string or network restriction (e.g., Supabase requires the pooling URL for serverless environments).
**Solution**: Verify `DATABASE_URL` in your `.env`. For Vercel/serverless, use the **connection pooling** URL from Supabase (not the direct URL). The `DIRECT_URL` should use the direct connection.

### Symptom: Prisma property does not exist (e.g., `adminLoginAttempt` missing)
**Issue**: Local Prisma client types are stale and don't reflect the latest schema.
**Solution**: Run `npx prisma generate` to regenerate the client. This must be done locally any time the `schema.prisma` file changes.

### Symptom: Drift between Schema and DB
**Issue**: Manual changes were made to the database without a corresponding migration.
**Solution**: Run `npx prisma db pull` to sync the schema from the DB, or `npx prisma migrate dev` to apply schema changes to the local DB.

---

## 💳 Stripe & Payments

### Symptom: Webhook not receiving events locally
**Issue**: Stripe cannot reach `localhost` directly.
**Solution**: Use the Stripe CLI to forward events:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Copy the webhook signing secret printed by the CLI into `STRIPE_WEBHOOK_SECRET` in your `.env`.

### Symptom: Order stays in PENDING status after payment
**Issue**: The Stripe webhook is not reaching the application, so `payment_intent.succeeded` is never processed.
**Solution**:
1. Check that `STRIPE_WEBHOOK_SECRET` matches the secret from your Stripe webhook endpoint.
2. In production, verify the webhook endpoint URL in Stripe Dashboard → Developers → Webhooks.
3. Check Vercel function logs for errors from `/api/webhooks/stripe`.

### Symptom: `Payment service temporarily unavailable` error at checkout
**Issue**: `STRIPE_SECRET_KEY` is missing or incorrect in the environment.
**Solution**: Verify `STRIPE_SECRET_KEY` is set in Vercel environment variables. Use test keys (`sk_test_`) for development and live keys (`sk_live_`) for production.

---

## 🔐 Authentication

### Symptom: Admin login redirects back to login page after correct password
**Issue**: `JWT_SECRET` is missing or the cookie is not being set correctly.
**Solution**: Ensure `JWT_SECRET` is set in your `.env`. In development, verify cookies are being set by checking the browser's DevTools → Application → Cookies.

### Symptom: NextAuth session is null in API routes
**Issue**: `NEXTAUTH_SECRET` is missing or `NEXTAUTH_URL` does not match the current environment.
**Solution**: Ensure both `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set correctly. In development, `NEXTAUTH_URL` should be `http://localhost:3000`.

### Symptom: Too many login attempts — account locked out
**Issue**: The database-backed rate limiter (5 attempts / 15 min) has triggered.
**Solution**: Wait 15 minutes for the window to expire, or directly delete the relevant `AdminLoginAttempt` record from the database using Supabase's table editor.

---

## 📧 Email (Resend)

### Symptom: Emails not being received
**Issue**: `RESEND_API_KEY` is missing, or the sending domain is not verified in Resend.
**Solution**:
1. Check `RESEND_API_KEY` is set correctly.
2. In production, verify your domain in Resend Dashboard → Domains and add the required DNS records (SPF, DKIM) in GoDaddy.
3. In development, Resend only allows sending to the email registered with your Resend account unless the domain is verified.

---

## 🔄 Cache & UI

### Symptom: Updated menu item doesn't appear on the public menu
**Issue**: Next.js Data Cache is serving a stale version.
**Solution**:
1. Hard-refresh the browser (Cmd+Shift+R / Ctrl+Shift+R).
2. Ensure the admin API handler calls `revalidatePath('/menu')` after the update.
3. If still stale, manually redeploy from the Vercel dashboard.

---

## 🧪 Testing

### Symptom: Tests wipe production data
**Issue**: Test environment is pointing to the production `DATABASE_URL`.
**Solution**: Always use a separate `.env.test` file with a test database URL. The project includes a safety guard in `tests/helpers/db.ts` that aborts if it detects a Supabase/AWS production URL.

### Symptom: Playwright tests fail on auth
**Issue**: `ADMIN_PASSWORD` in `.env.test` does not match the password used in the test fixture.
**Solution**: Check that `ADMIN_PASSWORD` is correctly defined in `.env.test` and matches what `admin-auth.ts` is using.
