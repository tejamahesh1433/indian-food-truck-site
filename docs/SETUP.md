# Setup & Development Guide

## Prerequisites

Before getting started, ensure you have:

- **Node.js** 18.17.0 or higher (check with `node --version`)
- **npm** 9.0.0 or higher (check with `npm --version`)
- **PostgreSQL** 14+ installed and running
- **Git** for version control
- **VS Code** or preferred code editor

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd indian-food-truck
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Next.js 16.2.3
- React & TypeScript
- Prisma ORM
- Tailwind CSS
- NextAuth v4
- Stripe SDK
- Resend email SDK

### 3. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql shell, create database
CREATE DATABASE food_truck_db;

# Exit psql
\q
```

Or using a GUI tool like pgAdmin:
1. Right-click "Databases"
2. Create → Database
3. Name: `food_truck_db`

#### Set Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the values:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/food_truck_db"

# NextAuth Configuration
NEXTAUTH_SECRET="<generate-random-secret>"
NEXTAUTH_URL="http://localhost:3000"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."  # From Stripe Dashboard
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."  # From Stripe > Webhooks

# Resend Email Service
RESEND_API_KEY="re_..."  # From Resend Dashboard

# Optional: GitHub OAuth
GITHUB_ID="..."
GITHUB_SECRET="..."

# Application URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

To generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Setup Stripe (Payment Processing)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign up or log in
3. Go to **Developers** → **API Keys**
4. Copy your test keys:
   - Publishable Key (starts with `pk_test_`)
   - Secret Key (starts with `sk_test_`)
5. Set up webhooks:
   - Go to **Developers** → **Webhooks**
   - Click "Add Endpoint"
   - Endpoint URL: `http://localhost:3000/api/webhooks/stripe`
   - Events to listen: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
   - Copy the webhook secret (`whsec_...`)

### 5. Setup Resend (Email Service)

1. Go to [Resend](https://resend.com)
2. Sign up with your email
3. Verify your email
4. Go to **API Keys**
5. Create new API key
6. Copy the key and set as `RESEND_API_KEY`

**Note**: Free tier has limitations (e.g., 100 emails/day). The app supports toggling email features for this constraint.

### 6. Setup GitHub OAuth (Optional)

For GitHub authentication support:

1. Go to GitHub Settings → **Developer settings** → **OAuth Apps**
2. Click **New OAuth App**
3. Fill in:
   - Application name: `Indian Food Truck`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Secret
5. Add to `.env.local`

### 7. Initialize Database Schema

Run Prisma migrations to create database tables:

```bash
# Run pending migrations
npx prisma migrate dev --name init

# Or if migrations don't exist
npx prisma db push
```

This creates all tables defined in `prisma/schema.prisma`.

### 8. (Optional) Seed Demo Data

To populate the database with demo menu items and settings:

```bash
npx prisma db seed
```

This runs the seed script in `prisma/seed.ts` and creates:
- Sample menu items (Butter Chicken, Biryani, etc.)
- Default site settings
- Demo user account

### 9. Start Development Server

```bash
npm run dev
```

The application starts on `http://localhost:3000`

### 10. Initial Admin Setup

1. Go to `http://localhost:3000/truckadmin/login`
2. Click "Sign up"
3. Create account with email and password
4. After login, go to `/admin/settings`
5. Configure:
   - Business name
   - Phone number
   - Instagram URL
   - Operating hours
   - Email preferences

## Development Workflow

### Running the App

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm run start

# Lint code
npm run lint

# Format code with Prettier
npm run format

# Type check
npx tsc --noEmit
```

### Database Management

```bash
# View database with Prisma Studio
npx prisma studio

# Create new migration
npx prisma migrate dev --name <migration-name>

# Reset database (⚠️ Deletes all data)
npx prisma migrate reset

# Push schema changes without migration
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### File Structure for Development

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API route handlers
│   ├── admin/             # Admin dashboard pages
│   ├── profile/           # Customer profile pages
│   └── (auth)/            # Authentication pages
├── components/            # Reusable React components
├── lib/
│   ├── auth.ts            # Authentication logic
│   ├── prisma.ts          # Database client
│   └── utils/             # Utility functions
└── config/
    └── site-config.ts     # Site configuration

prisma/
├── schema.prisma          # Database schema
└── migrations/            # Migration files
```

### Environment-Specific Configuration

**Development** (localhost):
- Uses test Stripe keys
- Emails go to development inbox (Resend)
- No rate limiting
- Verbose logging

**Production** (Vercel):
- Uses live Stripe keys
- Real email sending
- Rate limiting enabled
- Error monitoring (Sentry)

Set env var to control:
```env
NODE_ENV=development  # or production
```

## Testing

### Manual Testing Checklist

- [ ] Create user account
- [ ] Login with email/password
- [ ] Browse menu items
- [ ] Add items to cart
- [ ] Proceed to checkout
- [ ] Enter test card: `4242 4242 4242 4242` (exp: any future, CVC: any)
- [ ] Verify order created with PAID status
- [ ] Admin sees order in KDS
- [ ] Update order status to PREPARING
- [ ] Check real-time updates on customer side
- [ ] Mark order READY
- [ ] Customer receives notification
- [ ] User can download invoice

### Test Data

**Stripe Test Cards**:
- `4242 4242 4242 4242` - Successful payment
- `4000 0000 0000 0002` - Payment declined
- `4000 0025 0000 3155` - 3D Secure required
- `4000 0000 0000 9995` - Refund available

**Test Email**:
- Any email can be used in development
- Resend development mode catches emails

### Running Tests

```bash
# Jest unit tests (if configured)
npm run test

# E2E tests with Playwright (if configured)
npm run test:e2e
```

## Deployment

### Deploy to Vercel (Recommended)

Vercel is the optimal choice as it's made by the Next.js creators.

#### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### Step 2: Deploy via Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repository
4. Configure environment variables:
   - DATABASE_URL
   - NEXTAUTH_SECRET (different from dev)
   - STRIPE_SECRET_KEY (live key)
   - STRIPE_PUBLISHABLE_KEY (live key)
   - STRIPE_WEBHOOK_SECRET
   - RESEND_API_KEY
5. Click Deploy

#### Step 3: Update Environment Variables

After deployment:

1. In Vercel dashboard, go to project Settings
2. Go to Environment Variables
3. Generate new `NEXTAUTH_SECRET` for production:
   ```bash
   openssl rand -base64 32
   ```
4. Update Stripe webhook URL to production domain
5. Update callback URLs in NextAuth config

#### Step 4: Setup Production Database

Option A: Use PostgreSQL cloud service (Recommended)

```bash
# Providers: Vercel Postgres, Railway, Supabase, AWS RDS

# Update DATABASE_URL in Vercel environment variables
# Run migrations on production:
npm install -g vercel
vercel env pull  # Download env vars
npx prisma migrate deploy
```

Option B: Use local PostgreSQL (not recommended for production)

### Deploy with Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build application
COPY . .
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "run", "start"]
```

Build and run:

```bash
docker build -t food-truck .
docker run -p 3000:3000 --env-file .env.production food-truck
```

### Deploy to Railway

1. Connect GitHub repository to Railway
2. Add PostgreSQL database
3. Set environment variables
4. Deploy automatically on push

### Health Checks

Monitor deployment health:

```bash
# Check if server is running
curl https://yourdomain.com/api/health

# View Vercel deployment logs
vercel logs
```

## Production Checklist

Before going live:

- [ ] Set `NODE_ENV=production`
- [ ] Use live Stripe keys (not test)
- [ ] Configure production database
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Setup email service (Resend) with verified domain
- [ ] Enable email verification in admin settings
- [ ] Setup Stripe webhooks for production
- [ ] Configure CORS properly
- [ ] Enable HTTPS/SSL
- [ ] Setup error monitoring (Sentry)
- [ ] Enable analytics (Google Analytics)
- [ ] Test all payment flows
- [ ] Test email sending
- [ ] Verify database backups
- [ ] Setup monitoring and alerts
- [ ] Review security settings
- [ ] Load test the application
- [ ] Test on mobile devices
- [ ] Verify offline functionality (PWA)

## Troubleshooting

### Database Connection Error

```
Error: P1000 Authentication failed against database server
```

**Solution**:
- Check `DATABASE_URL` in `.env.local`
- Verify PostgreSQL is running: `psql -U postgres`
- Reset password if needed

### Stripe Keys Not Working

```
Invalid API Key provided
```

**Solution**:
- Verify keys are from correct environment (test vs live)
- Keys must be surrounded by quotes in `.env.local`
- Restart dev server after changing env vars

### Email Not Sending

```
Resend API error: Invalid API key
```

**Solution**:
- Check `RESEND_API_KEY` is correct
- Verify email in Resend is verified
- Check free tier limits not exceeded
- Toggle email settings in admin if using free tier

### Hydration Mismatch Error

```
Hydration failed because the initial UI does not match...
```

**Solution**:
- Check `suppressHydrationWarning` attributes on dynamic content
- Verify server/client rendering consistency
- Clear `.next` build cache: `rm -rf .next`
- Restart dev server

### Port 3000 Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**:
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Prisma Client Issues

```
Can't reach database server at X
```

**Solution**:
```bash
# Regenerate Prisma client
npx prisma generate

# Verify database connection
npx prisma db execute --stdin < connection-test.sql
```

## Performance Optimization

### Frontend Optimization

```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer
npm run build
# View next/bundle-analyzer output
```

### Database Optimization

```bash
# Check slow queries
# In Prisma Studio: npx prisma studio
# Monitor with: npx prisma db execute --stdin

# Add indexes for frequently queried fields
# (already done in schema.prisma for orders, users, etc.)
```

### Caching Strategy

- Static pages: Pre-generate at build time
- User data: Revalidate every 60 seconds
- Menu items: Revalidate every 5 minutes
- Admin data: Real-time with WebSocket

## Development Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Stripe Docs](https://stripe.com/docs)
- [NextAuth Docs](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

## Getting Help

- Check existing GitHub issues
- Create new GitHub issue with detailed description
- Review error logs: `vercel logs`
- Database debug: `npx prisma studio`
- Network errors: Browser DevTools → Network tab

## Support

For setup help:
- Documentation: `README.md`
- API Reference: `API.md`
- Features: `FEATURES.md`
- Troubleshooting: This file

---

**Last Updated**: April 23, 2026
**Version**: 1.0.0
**Maintained by**: Tejamahesh
