# System Architecture

## System Architecture Diagram

The Indian Food Truck Management System is built on a modern, decoupled architecture leveraging Next.js as the core application engine.

```mermaid
graph TD
    subgraph "External Entities"
        Guest([Customer / Guest])
        AuthUser([Authenticated User])
        Owner([Admin User])
        StripeSvc[Stripe Payments]
        EmailSvc[Resend Email API]
        MapsAPI[Google Maps]
    end

    subgraph "Browser (Client)"
        SW[Service Worker - PWA]
        Pages[App Router Pages]
        Comps[React Components]
        Providers[Context Providers - SiteProvider / CartProvider / AuthProvider]
    end

    subgraph "Next.js Application (Vercel)"
        direction TB
        subgraph "Frontend Layer"
            Customer[Customer Pages - Menu / Checkout / Tracking]
            Admin[Admin Pages - Dashboard / Kitchen Display]
            KDS[AdminOrdersClient - 8s Live Polling]
        end
        subgraph "Logic Layer"
            API[REST API Routes]
            Middleware[middleware.ts - Admin Auth Guard]
            NextAuth[NextAuth.js - User Auth]
            Webhook[Stripe Webhook Handler]
            Auth[Password Reset & Email Verification]
        end
    end

    subgraph "Persistence Layer (Supabase)"
        Prisma[Prisma ORM]
        DB[(PostgreSQL Database)]
    end

    Guest --> |Browse Menu / Catering| Pages
    Guest --> |Place Order| API
    AuthUser --> |Login / Profile / Orders| NextAuth
    Owner --> |Admin Login| Middleware
    Owner --> |CRUD Operations| API

    Pages --> Comps
    Comps --> Providers
    Comps --> SW
    API --> Prisma
    NextAuth --> Prisma
    Auth --> Prisma
    Prisma --> DB

    Admin --> KDS
    KDS --> |Poll /api/admin/orders/live| API
    API --> |Live order updates| KDS

    API --> |Create PaymentIntent| StripeSvc
    StripeSvc --> |payment_intent.succeeded| Webhook
    Webhook --> |Mark Order PAID| Prisma
    Webhook --> |Confirmation Email| EmailSvc
    API --> |Catering Email| EmailSvc
    API --> |Password Reset Email| EmailSvc
    Comps --> |Map Links| MapsAPI

    DB --> |Push Notifications (Planned)| SW
```

## Architectural Overview

- **Next.js 16 (Vercel)**: Full-stack framework handling both React rendering and server-side API logic via App Router.
- **Prisma + PostgreSQL (Supabase)**: Type-safe data access with relational integrity for all models.
- **NextAuth.js**: Handles customer authentication (sign up, sign in, sessions) with JWT strategy and Prisma adapter.
- **Stripe**: Processes online payments via Payment Intents. Webhook confirms payment and triggers order fulfillment.
- **Resend**: Sends transactional emails — order confirmations to customers and notifications to admin.
- **Context-Driven State**: `SiteProvider` (site settings), `CartProvider` (cart state + localStorage), `AuthProvider` (user session).
- **Admin Auth**: Separate from NextAuth — custom JWT cookie system protecting `/admin`, `/truckadmin`, and `/api/admin` routes via `middleware.ts`.

---

## Frontend Layer

Built using Next.js, React 19, and Tailwind CSS with PWA capabilities.

Responsibilities:
* Rendering UI (Server Components for data-heavy pages, Client Components for interactivity)
* Cart management with localStorage persistence and auth-aware cart switching
* Stripe Elements for secure card input on the checkout page
* Real-time order and catering chat interfaces with periodic polling
* Special instructions (notes) input for orders and individual items
* Review submission and rating forms (linked from order tracking page and profile)
* Animation layers using Framer Motion and GSAP
* **Live Kitchen Display System** — AdminOrdersClient component with 8-second auto-refresh polling for real-time order updates
* Service Worker for PWA offline-first functionality
* Push notification support via Service Worker (planned feature)

---

## Backend Layer

Implemented with Next.js API routes.

Responsibilities:
* Process and validate online orders (Zod schema + server-side price verification from DB)
* Handle 15-second order cancellation window (customers can cancel immediately after placement)
* Store and display special instructions (notes) at item and order level
* Create Stripe PaymentIntents and handle webhook events
* Process catering requests with anti-spam (honeypot + rate limiting)
* Handle admin authentication with timing-safe comparisons and DB-backed rate limiting
* Support password reset flow with email-based token validation
* Manage customer reviews with admin approval workflow
* Serve live order data for admin kitchen display (8-second polling endpoint)
* Calculate and serve sales analytics with 7 date range options
* Update menu items, site settings, and truck schedule
* Send transactional emails via Resend (order confirmations, password resets, catering links)

---

## Database Layer

Uses PostgreSQL via Prisma ORM (hosted on Supabase).

Responsibilities:
* Store menu items, categories, orders, and order items (with per-item notes)
* Store order-level special instructions (notes field)
* Store catering requests, catering items, and catering categories
* Store user accounts, sessions, and NextAuth tokens
* Store password reset tokens with expiration
* Store customer reviews with admin approval workflow
* Store site settings as a global singleton
* Store saved truck locations
* Store admin login attempt records for rate limiting
* Store notification logs and push subscriptions (planned for v2.0)

---

## Security Architecture

* **Admin routes** protected by `middleware.ts` — JWT token verified on every request
* **User routes** protected by NextAuth session checks
* **Admin login** uses timing-safe string comparison (`crypto.timingSafeEqual`) and database-backed rate limiting (5 attempts / 15 min)
* **Stripe webhook** validated via `stripe.webhooks.constructEvent` signature check
* **Prices** verified server-side against database on every order — client-sent prices are ignored
* **Cookies** set with `httpOnly: true`, `secure: true` (production), `sameSite: lax`
