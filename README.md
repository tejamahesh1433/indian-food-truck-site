# Indian Food Truck Management System

## 🚚 Overview

The **Indian Food Truck Management System** is a premium, full-stack platform designed for modern mobile food businesses. It bridges the gap between street food and professional catering through a stunning customer interface and a robust administrative control panel — with full online ordering and payment processing built in.

---

## ✨ Features

### 👤 Customer Experience
- **Online Ordering**: Add items to cart, pay securely via Stripe, and receive an email confirmation with an order tracking link.
- **Order Tracking**: Real-time order status page with a live chat channel to the truck owner.
- **Interactive Menu**: Explore daily street food offerings with dietary tags (Veg, Spicy, Popular).
- **Catering Selection Flow**: Professional item selection tool with "Half Tray" vs "Full Tray" logic.
- **Live Location**: Real-time "Next Stop" tracking with Google Maps integration.
- **User Accounts**: Sign up, log in, and view full order history from a profile page.
- **Modern UI**: Dark-mode aesthetic with glassmorphism and smooth Framer Motion animations.

### 🔐 Admin Suite
- **Orders Dashboard**: View all incoming paid orders, update statuses (Preparing → Ready → Completed), and chat with customers.
- **Control Center**: Manage menu prices, availability, and descriptions in real-time.
- **Catering Inbox**: Centralized dashboard for handling quote requests and client discussions.
- **Schedule Manager**: One-click updates for truck deployment locations.
- **Scalable Settings**: Configurable branding, contact info, and global maintenance toggles.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS / Custom CSS (Glassmorphism)
- **Database**: PostgreSQL (Supabase) via Prisma ORM
- **Authentication**: NextAuth.js (Email/Password + JWT sessions)
- **Payments**: Stripe (Payment Intents + Webhooks)
- **Email**: Resend (Transactional emails)
- **Analytics**: Vercel Analytics
- **Testing**: Vitest / Playwright
- **Deployment**: Vercel

---

## 📚 Documentation

### Quick-Start Documentation
Start here for essential information:

1. [**API.md**](./docs/API.md) - Complete API endpoint documentation with request/response examples (40+ endpoints)
2. [**FEATURES.md**](./docs/FEATURES.md) - Comprehensive feature list (130+ implemented features with status)
3. [**SETUP.md**](./docs/SETUP.md) - Development setup, deployment guide, and troubleshooting

### Detailed Documentation
Comprehensive guides in the `docs/` folder:

1. [**Project Presentation**](https://tejamahesh1433.github.io/indian-food-truck-site/indian-food-truck-presentation.html) - Slide deck overview of the project.
2. [**Project Overview**](./docs/PROJECT_OVERVIEW.md) - Problem statement and objectives.
3. [**System Architecture**](./docs/SYSTEM_ARCHITECTURE.md) - Tech stack and component roles.
4. [**Database Design**](./docs/DATABASE_DESIGN.md) - Schema definitions and ER diagrams.
5. [**Data Flow**](./docs/DATA_FLOW.md) - How data moves through the system.
6. [**Component Library**](./docs/COMPONENT_LIBRARY.md) - UI component breakdown.
7. [**Admin Modules**](./docs/ADMIN_MODULES.md) - Guide to the dashboard features.
8. [**User Manual**](./docs/USER_MANUAL.md) - How to use the site as a customer or owner.
9. [**Style Guide**](./docs/STYLE_GUIDE.md) - Design language and patterns.
10. [**Testing**](./docs/TESTING.md) - Strategy and layers of verification.
11. [**Deployment**](./docs/DEPLOYMENT.md) - Setup, installation, and production guides.
12. [**Troubleshooting**](./docs/TROUBLESHOOTING.md) - Common issues and fixes.
13. [**Roadmap**](./docs/FUTURE_IMPROVEMENTS.md) - Future feature planning.
14. [**Portfolio Report**](./docs/PORTFOLIO_REPORT.md) - Technical deep-dive report.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client (required after install)
npx prisma generate

# Run DB migrations
npx prisma migrate dev

# Start development server
npm run dev
```

---

## 🔑 Required Environment Variables

```env
# Database (Supabase)
DATABASE_URL=
DIRECT_URL=

# Authentication (NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Admin
ADMIN_PASSWORD=
JWT_SECRET=
ADMIN_ACCESS_PIN=
ADMIN_EMAIL=

# Payments (Stripe)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Email (Resend)
RESEND_API_KEY=
```

---

## 👨‍💻 Author
**Teja Mahesh Neerukonda**

---
*A portfolio-quality full-stack solution for the mobile food industry.*
