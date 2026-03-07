# Deployment Guide

## Local Requirements

* **Node.js**: v18+ 
* **Database**: PostgreSQL (Local or Docker for testing)
* **Environment**: `.env` file for production/dev, `.env.test` for testing.

---

## Setup Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Database Initialization**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. **Seeding**
   ```bash
   # Seed the professional catering menu
   npx ts-node prisma/seed-catering.ts
   ```

4. **Run Development**
   ```bash
   npm run dev
   ```

---

## Production Deployment (Vercel)

1. **Repository**: Push the code to a GitHub repository.
2. **Environment Variables**:
   * `DATABASE_URL`: Production Supabase/PostgreSQL link.
   * `DIRECT_URL`: Direct connection link for migrations.
   * `JWT_SECRET`: Secure string for admin tokens.
   * `ADMIN_PASSWORD`: Password for the dashboard.
   * `RESEND_API_KEY`: For email notifications (if enabled).
3. **Build Settings**:
   * Framework: Next.js
   * Build Command: `prisma generate && next build`
   * Output Directory: `.next`
