# Portfolio Technical Report: Indian Food Truck Management System

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Project Introduction](#project-introduction)
3. [System Architecture](#system-architecture)
4. [User Interface Design & Aesthetics](#user-interface-design--aesthetics)
5. [Database Architecture & Schema](#database-architecture--schema)
6. [Core Module Deep-Dives](#core-module-deep-dives)
7. [Security Architecture](#security-architecture)
8. [API & Integration Layer](#api--integration-layer)
9. [Testing & Quality Assurance](#testing--quality-assurance)
10. [Deployment & DevOps](#deployment--devops)
11. [Conclusion & Future Roadmap](#conclusion--future-roadmap)

---

## Executive Summary

The **Indian Food Truck Management System** is a sophisticated, production-ready full-stack platform designed to modernize mobile food operations. It integrates a premium consumer-facing storefront with a comprehensive admin control panel, delivering end-to-end functionality: online menu browsing, Stripe-powered ordering and payment, real-time order tracking, professional catering inquiry management, and a fully configurable business dashboard. This report details the architectural decisions, security engineering, design philosophy, and technical rigor applied throughout development.

---

## Project Introduction

In the mobile food industry, businesses struggle with fragmented communication, manual logistics, and missed revenue from customers who cannot reach the truck. This project was conceived to solve four primary pain points:

1. **Discovery**: Providing customers a real-time view of the truck's current location and schedule.
2. **Online Ordering**: Enabling direct-to-truck ordering with secure payment processing — eliminating lost sales from queue-shy customers.
3. **Catering Logistics**: Transitioning from informal emails to a structured, professional item selection and quote flow.
4. **Operational Control**: Giving owners a centralized dashboard to manage all aspects of the business without touching code.

---

## System Architecture

The application is built on the **Next.js 16 App Router** architecture, combining server-side rendering for performance with client-side interactivity for a seamless user experience.

### Technical Stack

- **Languages**: TypeScript (full-stack type safety)
- **Framework**: Next.js 16 (App Router, Server & Client Components)
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **Authentication**: NextAuth.js (customer accounts) + custom JWT (admin)
- **Payments**: Stripe (Payment Intents + Webhooks)
- **Email**: Resend (transactional emails)
- **Styling**: Tailwind CSS with custom glassmorphism layers
- **Animation**: Framer Motion + GSAP
- **Analytics**: Vercel Analytics (privacy-friendly, no cookies)
- **Testing**: Vitest (unit/integration) & Playwright (E2E)
- **Deployment**: Vercel (CI/CD on every push)

### System Architecture Diagram

```mermaid
graph TD
    subgraph "External Entities"
        Guest([Customer])
        AuthUser([Authenticated User])
        Owner([Admin User])
        StripeSvc[Stripe]
        EmailSvc[Resend]
        MapsAPI[Google Maps]
    end

    subgraph "Next.js Application - Vercel"
        direction TB
        subgraph "Frontend Layer"
            Pages[App Router Pages]
            Comps[React Components]
            Providers[SiteProvider / CartProvider / AuthProvider]
        end
        subgraph "Logic Layer"
            API[REST API Routes]
            Middleware[middleware.ts - Admin Guard]
            NextAuth[NextAuth.js]
            Webhook[Stripe Webhook]
        end
    end

    subgraph "Persistence Layer - Supabase"
        Prisma[Prisma ORM]
        DB[(PostgreSQL)]
    end

    Guest --> Pages
    Guest --> API
    AuthUser --> NextAuth
    Owner --> Middleware
    Owner --> API

    API --> Prisma
    NextAuth --> Prisma
    Prisma --> DB

    API --> StripeSvc
    StripeSvc --> Webhook
    Webhook --> Prisma
    Webhook --> EmailSvc
    API --> EmailSvc
    Comps --> MapsAPI
```

---

## User Interface Design & Aesthetics

The design language is a "Premium Dark Mode" aesthetic — inspired by Indian spice colors and elevated dining experiences.

### Design System Highlights

- **Glassmorphism**: Cards styled with `bg-white/5 border border-white/10 backdrop-blur-xl` create depth and layering.
- **Spice Color Palette**: Primary CTAs in saffron orange (`#f97316`). Ambient radial glows in turmeric orange, chili red, and ginger yellow throughout `globals.css`.
- **Animation**: Framer Motion scroll-reveal animations on all page sections (fade + slide-up). GSAP powers the hero text split animation.
- **Typography**: Geist Sans variable font for clean, modern heading and body text.
- **Responsive**: Mobile-first layout using Tailwind CSS breakpoints across all pages.

---

## Database Architecture & Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Order : "places"
    User ||--o{ Account : "has"
    Order ||--o{ OrderItem : "contains"
    Order ||--o{ OrderMessage : "has"
    CateringRequest ||--o{ CateringMessage : "has"
    MenuItem }|--|| MenuCategory : "categorised_by"
    CateringItem }|--|| CateringCategory : "categorised_by"

    User {
        string id PK
        string email "Unique"
        string password "bcrypt hashed"
    }

    Order {
        string id PK
        string userId FK
        int totalAmount "In cents"
        enum status "PENDING|PAID|PREPARING|READY|COMPLETED|CANCELLED"
        string stripeSessionId
        string chatToken "UUID for tracking"
    }

    OrderItem {
        string id PK
        string orderId FK
        string name "Price snapshot"
        int priceCents "Price snapshot"
        int quantity
    }

    CateringRequest {
        string id PK
        string status "NEW|CONTACTED|DONE"
        string chatToken "Unique access key"
        json selections
    }

    MenuItem {
        string id PK
        int priceCents
        boolean isAvailable
        int sortOrder
    }

    SiteSettings {
        string id PK "Always 'global'"
        boolean cateringEnabled
        string todayStatus "OPEN|CLOSED"
        string adminAccessPin
    }
```

### Use Case Diagram

```mermaid
graph TD
    subgraph "External Actors"
        G[Guest / Visitor]
        U[Authenticated Customer]
        A[Admin / Owner]
    end

    subgraph "Indian Food Truck System"
        UC1(Browse Menu & Location)
        UC2(Place Online Order)
        UC3(Track Order & Chat)
        UC4(Submit Catering Inquiry)
        UC5(Catering Chat via Token)
        UC6(Sign Up / Sign In)
        UC7(View Order History)
        UC8(Manage Orders & Status)
        UC9(Manage Menu & Categories)
        UC10(Manage Catering Requests)
        UC11(Update Truck Schedule)
        UC12(Configure Site Settings)
    end

    G --> UC1
    G --> UC2
    G --> UC4
    G --> UC5
    G --> UC6

    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC7

    A --> UC8
    A --> UC9
    A --> UC10
    A --> UC11
    A --> UC12
    A --> UC3
    A --> UC5
```

### Sequence Diagram — Catering Request Flow

```mermaid
sequenceDiagram
    autonumber
    participant C as Customer (Browser)
    participant S as Next.js Server
    participant DB as Prisma / PostgreSQL
    participant E as Resend Email
    participant A as Admin (Dashboard)

    C->>C: Select catering items in CateringPage
    C->>C: Fill out event inquiry form

    C->>S: POST /api/catering (selections + event data)

    critical Server-Side Checks
        S->>S: Zod schema validation
        S->>S: Honeypot field check (bot protection)
        S->>S: Rate limit check (3 per 15 min per IP)
        S->>DB: Check cateringEnabled in SiteSettings
        DB-->>S: cateringEnabled = true
    end

    S->>DB: Create CateringRequest (status: NEW, chatToken: UUID)
    DB-->>S: Record created

    S->>E: sendChatLinkEmail (customer confirmation + chat link)
    E-->>C: Email with link to /catering/chat/[token]

    S-->>C: 200 OK { ok: true, chatToken }

    Note over A,DB: Admin sees new request in inbox
    A->>S: GET /api/admin/catering
    S->>DB: Fetch all requests
    DB-->>S: Requests list
    S-->>A: Renders catering inbox

    A->>A: Reviews event details & selections
    A->>S: POST /api/admin/catering/[id]/messages
    S->>DB: Save message (sender: ADMIN)
    DB-->>S: Message saved
    S-->>A: { ok: true }

    C->>S: GET /api/chat/[token]/messages (polling)
    S->>DB: Fetch messages for token
    DB-->>S: Messages including admin reply
    S-->>C: Customer sees admin message

    C->>S: POST /api/chat/[token]/messages (customer reply)
    S->>DB: Save message (sender: CUSTOMER)
    S-->>C: { ok: true }

    A->>S: PATCH /api/admin/catering (status: CONTACTED)
    S->>DB: Update status
    S-->>A: Updated
```

### Key Design Decisions

- **Price snapshots on OrderItem**: Item prices and names are copied at order time, ensuring historical accuracy even as menu prices change.
- **Server-side price verification**: The orders API fetches live prices from the database and ignores client-submitted prices entirely, preventing cart tampering.
- **Cents-as-integers**: All monetary values stored as `Int` (cents) to eliminate floating-point precision issues.
- **Dual auth systems**: NextAuth handles customer sessions; a separate custom JWT system handles admin auth — keeping them fully isolated.
- **AdminLoginAttempt table**: Persistent rate limiting across serverless function instances (unlike in-memory maps which reset on cold starts).

---

## Core Module Deep-Dives

### 1. Online Ordering & Payment Flow

The ordering system is built around Stripe Payment Intents for a modern, reliable payment experience.

```mermaid
sequenceDiagram
    autonumber
    participant C as Customer
    participant S as Next.js Server
    participant DB as PostgreSQL
    participant ST as Stripe
    participant E as Resend Email
    participant A as Admin

    C->>S: POST /api/orders
    S->>S: Validate (Zod + DB prices)
    S->>DB: Create Order (PENDING)
    S->>ST: Create PaymentIntent
    ST-->>S: clientSecret
    S-->>C: clientSecret + orderId

    C->>ST: Confirm payment (Stripe Elements)
    ST-->>C: Payment succeeded

    ST->>S: Webhook: payment_intent.succeeded
    S->>S: Verify signature
    S->>DB: Order status → PAID
    S->>E: Customer confirmation email
    S->>E: Admin notification email
    E-->>C: Confirmation + tracking link
    E-->>A: New order alert

    C->>C: Redirect → /track/[token]
```

#### Order Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING : POST /api/orders
    PENDING --> PAID : Stripe webhook
    PENDING --> CANCELLED : Admin cancels
    PAID --> PREPARING : Admin action
    PREPARING --> READY : Admin action
    READY --> COMPLETED : Admin action
    READY --> CANCELLED : Admin cancels
    COMPLETED --> [*]
    CANCELLED --> [*]
```

Flow:
1. Customer adds items to cart (localStorage-persisted, auth-aware).
2. `POST /api/orders` validates the request, fetches DB prices, creates a `PENDING` order, and returns a Stripe `clientSecret`.
3. Customer completes payment in the Stripe Elements form.
4. Stripe fires `payment_intent.succeeded` to the webhook endpoint.
5. Webhook marks the order as `PAID`, sends a customer confirmation email, and sends an admin notification email.
6. Customer is redirected to `/track/[token]` for live status updates and chat.

### 2. Professional Catering Selection Flow

Unlike standard inquiry forms, this module allows customers to configure complex orders with real-time feedback before submitting.

- `CateringItemDrawer` handles "Half Tray" vs "Full Tray" pricing logic and enforces `minPeople` for packages.
- `CateringSelectionSummary` shows a running total and submits the full selection as JSON.
- On submission, a chat token is generated and emailed to the customer as a unique link to `/catering/chat/[token]`.

### 3. Admin Dashboard

A secure, feature-rich control center for managing all aspects of the business.

- **Orders module**: View paid orders, update statuses through the fulfillment lifecycle, chat with customers.
- **Menu management**: Full CRUD with drag-to-reorder, availability toggles, and bulk operations.
- **Catering inbox**: Status tracking, internal notes, and per-request chat threads.
- **Schedule manager**: Today/next-stop location, hours, notes, and saved location presets.
- **Site settings**: Global configuration including announcement banner, catering toggle, and access PIN gate.

### 4. Cart System

The `CartProvider` uses React Context with localStorage persistence. Carts are keyed by user email when authenticated, ensuring cart contents persist across sessions and switch cleanly on login/logout.

---

## Security Architecture

Security was treated as a first-class concern throughout development.

- **Admin middleware**: `src/middleware.ts` protects all `/admin`, `/truckadmin`, and `/api/admin` routes via JWT verification on every request.
- **Timing-safe comparison**: Admin password comparison uses `crypto.timingSafeEqual` with SHA-256 hashing to prevent timing attacks.
- **Database-backed rate limiting**: Admin login and PIN verification are rate-limited (5 attempts / 15 min per IP) using the `AdminLoginAttempt` table — reliable across serverless cold starts unlike in-memory solutions.
- **Server-side price verification**: Order totals are calculated entirely from database prices. Client-submitted prices are discarded.
- **Stripe webhook signature verification**: All webhook events validated via `stripe.webhooks.constructEvent` before processing.
- **Secure cookies**: Admin JWT cookies set with `httpOnly: true`, `secure: true` (production), `sameSite: lax`.
- **Zod validation**: All API endpoints validate incoming data with Zod schemas before processing.
- **Honeypot + rate limiting**: Catering form protected against bots.
- **Error boundary**: `src/app/error.tsx` catches unexpected runtime errors and shows a graceful error page.

---

## API & Integration Layer

The system exposes a comprehensive REST API across three categories:

**Public endpoints**: Menu, settings, catering submission, order creation, order tracking, chat.

**Authenticated endpoints** (NextAuth session): User order history.

**Admin endpoints** (JWT cookie): Full CRUD for menu, catering, orders, settings, saved locations.

**Webhook**: Stripe `payment_intent.succeeded` and `checkout.session.completed` handled at `/api/webhooks/stripe`.

All endpoints use Next.js Route Handlers in the App Router. No raw SQL is used — all database access goes through Prisma ORM, eliminating SQL injection risk.

---

## Testing & Quality Assurance

A 3-layer automated testing strategy ensures reliability across logic, database, and browser interactions.

Layers:
1. **Unit (Vitest)**: Price formatting, phone normalization, utility functions.
2. **Integration (Vitest)**: Prisma CRUD operations and API response codes against a test database.
3. **E2E (Playwright)**: Full browser simulation of customer ordering flow, catering submission, and admin login.

### Reliability Guards

- **Production Guard**: `tests/helpers/db.ts` aborts the test suite if it detects a production Supabase/AWS URL — preventing accidental data wipes.
- **Admin fixture**: Custom `adminPage` Playwright fixture auto-logs into the admin panel, avoiding repetitive login logic in E2E tests.
- **Database helpers**: `resetDatabase()` and `seedBasicData()` functions ensure a clean, consistent state before each test run.

---

## Deployment & DevOps

The system is deployed on **Vercel** with a continuous integration pipeline.

- **CI/CD**: Automatic builds triggered on every push to `main`. TypeScript compilation and Prisma client generation run as part of the build.
- **Build command**: `prisma generate && next build` — ensures the Prisma client is always up to date in the deployed environment.
- **Cache sync**: `revalidatePath()` called after admin mutations ensures public pages reflect changes within milliseconds without a full redeploy.
- **Environment isolation**: All secrets managed via Vercel environment variables. `.env` is gitignored and never committed.
- **SEO**: `sitemap.xml`, `robots.txt`, Open Graph meta tags, Twitter card meta, favicon, and Apple touch icon configured for production.

---

## Conclusion & Future Roadmap

The Indian Food Truck Management System delivers a complete, production-ready digital platform for a mobile food business — from first-time visitor to repeat customer, from inquiry to fulfilled order. The combination of a premium UI, a secure and scalable backend, full payment integration, and a powerful admin panel sets a high bar for what a food truck website can be.

### The Road Ahead

- **Phase 6**: Analytics dashboard with revenue trends and dish popularity charts.
- **Phase 7**: SMS order status notifications via Twilio, push notifications via Web Push API.
- **Phase 8**: Customer loyalty program with points and promo codes.
- **Phase 9**: Multi-truck support and role-based admin permissions.
- **Phase 10**: Email verification, enhanced password policies, and audit logs.

---
**Author**: Teja Mahesh Neerukonda
**GitHub**: [github.com/tejamahesh1433/indian-food-truck-site](https://github.com/tejamahesh1433/indian-food-truck-site)
