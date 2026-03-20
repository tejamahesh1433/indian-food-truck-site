# Indian Food Truck — Project Handover Document
## Account Transfer Checklist & Environment Variables

> [!IMPORTANT]
> Complete all transfers in the order listed. Update Vercel environment variables AFTER each account transfer. Test the live site after every change to confirm nothing is broken.

## Project Overview

| Service | Purpose | Transfer Required? |
| :--- | :--- | :--- |
| **GitHub** | Source code repository | Yes |
| **Vercel** | Hosting & deployment | Yes |
| **GoDaddy** | Domain name | Yes |
| **Supabase** | PostgreSQL database | Yes |
| **Stripe** | Payment processing | Yes — new keys needed |
| **Resend** | Transactional email | Yes |
| **Cloudinary** | Menu image storage | Yes |

---

## Account Transfers

### 1. GitHub — Source Code Repository
The entire codebase, commit history, and branches transfer to the client's GitHub account.
- [ ] Client creates a free GitHub account at github.com if they don't have one
- [ ] Open the repository on GitHub
- [ ] Settings → Danger Zone → "Transfer repository"
- [ ] Enter the client's GitHub username or organisation name
- [ ] Type the repository name to confirm and click Transfer
- [ ] Client accepts the transfer invitation from their GitHub email

> [!TIP]
> The repository URL will change after transfer. Update any CI/CD webhook URLs if configured.

### 2. Vercel — Hosting & Deployment
All environment variables, domains, and deployment settings transfer with the project.
- [ ] Client creates a Vercel account at vercel.com if they don't have one
- [ ] Open the project in Vercel dashboard
- [ ] Settings → General → scroll to "Transfer Project"
- [ ] Enter the client's Vercel account email and confirm
- [ ] Client accepts the transfer invitation
- [ ] Reconnect GitHub repository in the new Vercel account (if prompted)
- [ ] Verify automatic deployments still work by pushing a test commit

> [!NOTE]
> All environment variables transfer automatically with the project.

### 3. GoDaddy — Domain Name
Choose **ONE** of the two options below based on what the client prefers:

**Option A — Transfer to client's GoDaddy account (recommended):**
- [ ] Client creates a GoDaddy account and provides their Customer Number
- [ ] Go to GoDaddy → My Products → select the domain
- [ ] Click "Transfer domain to another GoDaddy account"
- [ ] Enter the client's Customer Number and confirm

**Option B — Transfer to a different registrar:**
- [ ] Unlock the domain in GoDaddy → My Products → Domain Settings
- [ ] Request the EPP/Auth Code from GoDaddy
- [ ] Provide Auth Code to client for transfer at their chosen registrar

> [!IMPORTANT]
> Ensure DNS records (A/CNAME pointing to Vercel) are recreated at the new registrar after transfer.

### 4. Supabase — PostgreSQL Database
All tables, data, storage buckets, and RLS policies transfer with the project.
- [ ] Client creates a Supabase account at supabase.com
- [ ] Client must be on the Pro plan ($25/month) to receive a project transfer
- [ ] Go to Supabase → Project Settings → General
- [ ] Click "Transfer project" and enter the client's Supabase account email
- [ ] Client accepts the transfer invitation
- [ ] After transfer: go to Settings → API and copy the new `DATABASE_URL` and `DIRECT_URL`
- [ ] Update `DATABASE_URL` and `DIRECT_URL` in Vercel environment variables
- [ ] Redeploy on Vercel and verify the site loads correctly

> [!WARNING]
> The database connection strings change after transfer. Vercel env vars must be updated before the next deployment.

### 5. Stripe — Payment Processing
Stripe accounts cannot be transferred directly. The client creates a new Stripe account and new API keys are generated.
- [ ] Client creates a Stripe account at stripe.com and completes business verification
- [ ] In Stripe dashboard: Developers → API keys → copy Publishable Key and Secret Key
- [ ] Update `STRIPE_PUBLISHABLE_KEY` in Vercel environment variables
- [ ] Update `STRIPE_SECRET_KEY` in Vercel environment variables
- [ ] In Stripe: Developers → Webhooks → "Add endpoint"
- [ ] Set endpoint URL to: `https://your-domain.com/api/webhooks/stripe`
- [ ] Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`
- [ ] Copy the Webhook Signing Secret and update `STRIPE_WEBHOOK_SECRET` in Vercel
- [ ] Make a test purchase to confirm payments and webhook work end-to-end

> [!WARNING]
> Existing order payment data and customer records live in the old Stripe account. Export any needed reports before switching.

### 6. Resend — Transactional Email
Used for order confirmation emails, catering request notifications, and contact form replies.
- [ ] Client creates a Resend account at resend.com
- [ ] In Resend: Add the domain (same domain as the website) and verify it via DNS records
- [ ] Generate a new API key in Resend → API Keys
- [ ] Update `RESEND_API_KEY` in Vercel environment variables
- [ ] Redeploy and send a test catering request to confirm emails are delivered

> [!NOTE]
> DNS verification for Resend adds MX/TXT/DKIM records. These are separate from domain transfer — add them at the new registrar or Cloudflare if DNS is managed there.

### 7. Cloudinary — Menu Image Storage
Stores and serves all menu item images via CDN.
- [ ] Client creates a Cloudinary account at cloudinary.com
- [ ] In Cloudinary: Settings → Account → invite client email as Owner
- [ ] Transfer ownership in Cloudinary dashboard
- [ ] Copy new `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- [ ] Update all three `CLOUDINARY_*` variables in Vercel environment variables
- [ ] Verify menu images still load on the live site after redeployment

---

## Vercel Environment Variables
After all account transfers, the client must update these variables in:
**Vercel Dashboard → Project → Settings → Environment Variables**

| Environment Variable | When to Update | Action Required |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase transferred | Copy from Supabase dashboard |
| `DIRECT_URL` | Supabase transferred | Copy from Supabase dashboard |
| `RESEND_API_KEY` | Resend account switched | Generate in Resend dashboard |
| `STRIPE_SECRET_KEY` | Stripe account switched | Copy from Stripe dashboard |
| `STRIPE_PUBLISHABLE_KEY` | Stripe account switched | Copy from Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | Webhook re-registered | Copy from Stripe webhook page |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary transferred | Copy from Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary transferred | Copy from Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary transferred | Copy from Cloudinary dashboard |
| `NEXTAUTH_SECRET` | Always generate fresh | **YES** — run: `openssl rand -base64 32` |
| `JWT_SECRET` | Always generate fresh | **YES** — run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Domain changes | Set to `https://your-domain.com` |
| `ADMIN_PASSWORD` | Client sets own | **YES** — client chooses password |
| `ADMIN_ACCESS_PIN` | Client sets own | **YES** — client chooses 6-digit PIN |

> [!TIP]
> Generate new secrets with: `openssl rand -base64 32`. Run this command twice — once for `NEXTAUTH_SECRET`, once for `JWT_SECRET`. Never reuse secrets between environments or clients.

---

## Post-Handover Verification Checklist
Run through these checks after all transfers and env var updates are complete:

### Site & App
- [ ] Home page loads correctly on desktop and mobile
- [ ] Menu page shows all items with images
- [ ] Cart and checkout flow works end-to-end (use Stripe test mode first)
- [ ] Catering form submits and sends email notification to the client
- [ ] Order confirmation email is received after a test purchase
- [ ] PWA install prompt appears on Android Chrome (Add to Home Screen)
- [ ] Offline page shows when device has no connection

### Admin Panel
- [ ] Admin login works with new PIN and password at `/truckadmin/login`
- [ ] Menu items can be added, edited, and deleted
- [ ] Truck schedule / location can be updated
- [ ] Catering requests are visible in the inbox
- [ ] Site settings (branding, contact info) can be updated

### Domain & Email
- [ ] Custom domain resolves correctly (no Vercel subdomain)
- [ ] SSL certificate is active (green padlock / HTTPS)
- [ ] Confirmation emails arrive from the correct sender domain
- [ ] SPF / DKIM / DMARC DNS records are set for the email domain

### Final Step
- [ ] Remove developer (your) access from all transferred accounts
- [ ] Provide client with all new login credentials securely
- [ ] Confirm client has access to billing for each paid service

---
*Indian Food Truck — Confidential Handover Document*
