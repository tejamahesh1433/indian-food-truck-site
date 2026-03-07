# Indian Food Truck Management System

## 🚚 Overview

The **Indian Food Truck Management System** is a premium, full-stack platform designed for modern mobile food businesses. It bridges the gap between street food and professional catering through a stunning customer interface and a robust administrative control panel.

---

## ✨ Features

### 👤 Customer Experience
- **Interactive Menu**: Explore daily street food offerings with dietary tags (Veg, Spicy).
- **Catering Selection Flow**: Professional item selection tool with "Half Tray" vs "Full Tray" logic.
- **Live Location**: Real-time "Next Stop" tracking with Google Maps integration.
- **Modern UI**: Dark-mode aesthetic with glassmorphism and smooth Framer Motion animations.

### 🔐 Admin Suite
- **Control Center**: Manage menu prices, availability, and descriptions in real-time.
- **Catering Inbox**: Centralized dashboard for handling quote requests and client discussions.
- **Schedule Manager**: One-click updates for truck deployment locations.
- **Scalable Settings**: Configurable branding, contact info, and global maintenance toggles.

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS / Vanilla CSS
- **Database**: PostgreSQL (Supabase) / Prisma ORM
- **Testing**: Vitest / Playwright
- **Deployment**: Vercel

---

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

1. [**Project Overview**](./docs/PROJECT_OVERVIEW.md) - Problem statement and objectives.
2. [**System Architecture**](./docs/SYSTEM_ARCHITECTURE.md) - Tech stack and component roles.
3. [**Database Design**](./docs/DATABASE_DESIGN.md) - Schema definitions and ER diagrams.
4. [**Admin Modules**](./docs/ADMIN_MODULES.md) - Guide to the dashboard features.
5. [**User Manual**](./docs/USER_MANUAL.md) - How to use the site as a customer or owner.
6. [**Testing**](./docs/TESTING.md) - Strategy and layers of verification.
7. [**Deployment**](./docs/DEPLOYMENT.md) - Setup, installation, and production guides.
8. [**Roadmap**](./docs/FUTURE_IMPROVEMENTS.md) - Future feature planning.

---

## 🚀 Quick Start

```bash
# Install
npm install

# Setup DB
npx prisma generate
npx prisma migrate dev

# Run
npm run dev
```

---

## 👨‍💻 Author
**Teja Mahesh Neerukonda**

---
*Developed as a portfolio-quality management solution for the mobile food industry.*
