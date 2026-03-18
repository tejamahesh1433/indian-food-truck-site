# Deployment Guide

## Local Requirements

* **Node.js**: v18+
* **Database**: PostgreSQL (local, Docker, or a Supabase project)
* **Environment**: `.env` file for development/production, `.env.test` for testing

---

## Setup Steps

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy the example below into a `.env` file in the project root and fill in your values:

```env
# Database (Supabase or local PostgreSQL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth (Customer Authentication)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate with: openssl rand -base64 32"

# Admin Authentication
ADMIN_PASSWORD="your-secure-admin-password"
JWT_SECRET="generate with: openssl rand -base64 32"
ADMIN_ACCESS_PIN="123456"
ADMIN_EMAIL="admin@yourdomain.com"

# Stripe (use test keys for development)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Resend)
RESEND_API_KEY="re_..."

# App URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. Run database migrations
```bash
npx prisma generate
npx prisma migrate dev
```

### 4. (Optional) Seed the catering menu
```bash
npx ts-node prisma/seed-catering.ts
```

### 5. Start the development server
```bash
npm run dev
```

### 6. Set up Stripe webhook for local development
```bash
# Install Stripe CLI, then:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Copy the webhook signing secret from the CLI output into `STRIPE_WEBHOOK_SECRET` in your `.env`.

---

## Production Deployment (Vercel)

### 1. Push to GitHub
Connect your repository to Vercel via the Vercel dashboard.

### 2. Configure Environment Variables in Vercel
Go to **Project → Settings → Environment Variables** and add all of the following:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase connection pooling URL |
| `DIRECT_URL` | Supabase direct connection URL (for migrations) |
| `NEXTAUTH_URL` | Your production domain e.g. `https://yourdomain.com` |
| `NEXTAUTH_SECRET` | Random secret string |
| `ADMIN_PASSWORD` | Admin dashboard password |
| `JWT_SECRET` | Random secret for admin JWT tokens |
| `ADMIN_ACCESS_PIN` | 6-digit site access PIN |
| `ADMIN_EMAIL` | Email to receive order notifications |
| `STRIPE_SECRET_KEY` | Stripe live secret key (`sk_live_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe live publishable key (`pk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Dashboard → Webhooks |
| `RESEND_API_KEY` | Resend API key |
| `NEXT_PUBLIC_BASE_URL` | Your production domain |

### 3. Build Settings
Vercel auto-detects Next.js. The build command in `package.json` is already configured:
```
prisma generate && next build
```

### 4. Set up Stripe Webhook (Production)
1. Go to **Stripe Dashboard → Developers → Webhooks → Add Endpoint**
2. URL: `https://yourdomain.com/api/webhooks/stripe`
3. Events to listen for:
   - `payment_intent.succeeded`
   - `checkout.session.completed`
4. Copy the **Signing Secret** into the `STRIPE_WEBHOOK_SECRET` env var in Vercel.

### 5. Redeploy
After adding all environment variables, trigger a fresh deployment from the Vercel dashboard to ensure they take effect.

---

## Going Live Checklist

Before switching to live/production mode:

- [ ] Switch Stripe keys from `sk_test_` / `pk_test_` to `sk_live_` / `pk_live_`
- [ ] Create a new Stripe webhook endpoint pointing to production URL
- [ ] Update `NEXTAUTH_URL` to the production domain
- [ ] Update `NEXT_PUBLIC_BASE_URL` to the production domain
- [ ] Update `sitemap.xml` URLs to the production domain
- [ ] Update `metadataBase` in `layout.tsx` to the production domain
- [ ] Verify Resend domain for sending from your custom email address
- [ ] Test a real order end-to-end with a small amount and refund it
- [ ] Confirm order notification emails are reaching the admin inbox
