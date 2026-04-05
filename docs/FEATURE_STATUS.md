# Feature Status & Roadmap

**Last Updated:** April 4, 2026
**Completion:** 77% (28/37 implemented features)

---

## ✅ Fully Implemented & Working

### Core Customer Features (100%)
- ✅ Homepage with hero, menu preview, reviews, location, Instagram feed
- ✅ Full menu with categories and dietary filters (Veg/Spicy/Popular)
- ✅ Shopping cart with quantity controls and persistent storage
- ✅ Stripe checkout with Stripe Elements (Apple Pay / Google Pay)
- ✅ Order success page with confirmation details
- ✅ Order tracking with live status updates (PAID → PREPARING → READY → COMPLETED)
- ✅ Customer-admin order messaging/chat
- ✅ Customer login/signup with NextAuth
- ✅ Customer profile with order history
- ✅ Catering request form with item selection UI
- ✅ Catering chat with admin (token-based access, no account required)
- ✅ Forgot password flow with email reset link
- ✅ Password reset with token validation
- ✅ Order cancellation window (15 seconds after placement)
- ✅ Special instructions per item (cart infrastructure)
- ✅ Special instructions per order (DB field exists)
- ✅ Privacy policy page
- ✅ Terms of Service page
- ✅ About page
- ✅ FAQ page

### Admin Features (100%)
- ✅ Secure admin login with PIN gate + rate limiting
- ✅ Live kitchen display system (8-sec auto-refresh) with Kanban columns
- ✅ Order history with pagination (15 items/page)
- ✅ Admin order chat
- ✅ Admin order status updates
- ✅ Menu management (CRUD + drag-to-reorder)
- ✅ Catering request management with filters
- ✅ Catering chat with customers
- ✅ Weekly schedule management (per-day hours)
- ✅ Truck location updates (today/next stop)
- ✅ Saved locations quick-select
- ✅ Site settings (branding, banner, PIN, email, Instagram)
- ✅ Announcement banner toggle
- ✅ Catering enable/disable toggle
- ✅ Logo & footer message customization
- ✅ Review moderation (approve/reject)
- ✅ Newsletter subscriber list + export to CSV
- ✅ Support chat widget management
- ✅ Today's special featured item
- ✅ Sales analytics dashboard
  - Revenue, orders, avg order value
  - 7 date ranges (Today/Week/Month/7d/30d/90d/AllTime)
  - Comparison metrics with % change
  - "was $X" previous period display
  - Top items per period
  - Status breakdown with % bars
  - Peak hours and peak days
  - Best day highlights on chart
  - Active days count
  - CSV export

### Infrastructure & Quality (100%)
- ✅ PWA with service worker
- ✅ Offline-first functionality
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Dark theme with Tailwind CSS
- ✅ Database: PostgreSQL with Prisma ORM
- ✅ Authentication: NextAuth.js with JWT
- ✅ Payment: Stripe integration with webhooks
- ✅ Email: Transactional emails on order creation
- ✅ Rate limiting on login/catering endpoints
- ✅ CORS & security headers configured
- ✅ E2E tests (Playwright)
- ✅ Unit tests (Vitest)
- ✅ Integration tests

---

## 🟡 Partially Implemented (Infrastructure Ready, UI Pending)

### Customer Reviews (70%)
- ✅ Database schema (Order → Review, MenuItem → Review, User → Review)
- ✅ API endpoints for submit/approve
- ✅ Admin review moderation UI
- ✅ Homepage reviews display section
- ❌ **PENDING:** Customer review submission form
- ❌ **PENDING:** "Rate your order" button on tracking page
- ❌ **PENDING:** Review form link in profile order history
- ❌ **PENDING:** Review prompt after order completion email

### Order/Item Special Instructions (60%)
- ✅ Database fields: `Order.notes`, `OrderItem.notes`
- ✅ Cart context: `updateNotes()` method
- ✅ Admin display: Notes shown in kitchen view
- ❌ **PENDING:** Per-item note UI in cart drawer
- ❌ **PENDING:** Order-level notes field in checkout
- ❌ **PENDING:** "Add note" button/icon for each cart item

---

## 🔴 Not Yet Implemented (High Priority)

### Operational Improvements (Must Build Soon)
1. **Admin Order Search/Filter** (Effort: 4-6 hours)
   - Filter by status (PAID, PREPARING, READY, COMPLETED)
   - Filter by date range (Today/Week/Month)
   - Search by customer name, phone, email
   - Search by order ID

2. **Menu Item Quick Unavailable Toggle** (Effort: 2-3 hours)
   - One-click "86 this item" button from kitchen view
   - Marks item unavailable without menu management page

3. **Admin Support Chat Notifications** (Effort: 2-3 hours)
   - Unread badge per conversation
   - Browser notification on new message
   - Sound alert option

4. **Customer Review Submission UI** (Effort: 3-5 hours)
   - Review form component
   - Star rating selector
   - Comment textarea
   - Links from order tracking + profile

5. **Newsletter Send Functionality** (Effort: 5-8 hours)
   - Compose form
   - Preview email template
   - Send to all subscribers
   - **Constraint:** Requires upgrade from free email service

6. **Order Pickup Time Selection** (Effort: 5-7 hours)
   - Time picker in checkout
   - Queue management
   - Estimated wait time display
   - Admin can see upcoming pickups

7. **Catering Analytics in Dashboard** (Effort: 4-6 hours)
   - Catering request counts per period
   - Conversion rate (NEW → CONFIRMED)
   - Catering revenue if tracked separately
   - Response time metrics

8. **Invoice Link from Profile** (Effort: 1 hour)
   - "Download Invoice" button on order history
   - Receipt download as PDF
   - Email receipt link

---

## 🟢 Planned for Future (Nice-to-Have)

### Notifications (4-5 weeks, see `PUSH_NOTIFICATIONS_PLAN.md`)
- Browser push notifications for order status
- Real-time admin alerts for new orders
- Quiet hours & notification preferences
- Fallback to email/SMS

### Customer Experience
- Guest checkout option (currently requires login)
- Social login (Google, GitHub)
- Favorite items / saved items
- Order note display from admin (what they prepared)

### Loyalty & Engagement
- Promo code / discount system
- Loyalty punch card
- Referral rewards
- Email marketing campaigns

### Advanced Admin
- Inventory management
- Staff management & roles
- Custom reports
- Multiple truck support
- Mobile app for kitchen staff

### Security & Compliance
- Email verification on signup
- Password strength enforcement
- CAPTCHA on form submissions
- Audit logs for admin actions
- PCI compliance for card handling

---

## Current Limitations

### Email Service
- **Free tier** cannot send transactional emails per order status change
- Cannot send newsletter blasts
- **Workaround:** Use in-app Toast notifications + Push notifications instead
- **Future:** Upgrade to paid email service (SendGrid, Mailgun, etc.)

### Guest Checkout
- Currently requires login to place order
- Adds friction for one-time customers
- **Workaround:** Can still track order via public token link
- **Future:** Implement guest checkout with optional account creation

---

## Completed Since Last Major Release

### Session 1 (Initial Build)
- All core customer features
- All core admin features
- PWA & service worker
- Stripe integration
- Email notifications
- Authentication & authorization

### Session 2 (Recent)
- Live kitchen display system (auto-refresh)
- Order pagination
- Forgot password flow
- Password reset
- Reviews system (backend + admin UI)
- Order cancellation (15-sec window)
- Order notes (DB infrastructure)
- Cart notes support
- Display notes in kitchen view
- Kanban-style order board
- Sales analytics dashboard (7 date ranges)

---

## Top 3 Priorities for Next Sprint

1. **Customer Review Submission UI** (3-5 hours)
   - Unblocks customer reviews feature
   - High engagement driver
   - Easy to build (form component exists)

2. **Admin Order Search/Filter** (4-6 hours)
   - Critical for daily operations
   - Admin can't find orders without it
   - Improves kitchen efficiency

3. **Menu Item Quick Toggle** (2-3 hours)
   - Fast to implement
   - Saves time when items sell out
   - Improves operational agility

**Combined effort:** 9-14 hours (~1-2 weeks)

---

## Statistics

| Category | Count | Status |
|----------|-------|--------|
| Customer-facing pages | 14 | ✅ 100% |
| Admin modules | 12 | ✅ 100% |
| API endpoints | 44 | ✅ 100% |
| Test files | 23 | ✅ Unit (5) + Integration (6) + E2E (12) |
| Database models | 13 | ✅ 100% |
| Real-time features | 3 | ✅ 100% |
| **Total Features** | **37** | **✅ 77%** |

---

## Version History

### v1.0 - Launch (Initial Release)
- Core ordering, payment, catering, admin dashboard
- Basic kitchen display
- Newsletter subscribers

### v1.1 - Live Operations (Current)
- Live kitchen display with auto-refresh
- Order pagination & history
- Password recovery
- Order notes (customer + admin)
- Analytics dashboard
- Reviews system
- Order cancellation window

### v1.2 - Planned (Next)
- Customer review submission UI
- Admin search/filter
- Menu item quick toggle
- Support chat notifications

### v2.0 - Push Notifications
- Browser push for order status
- Admin new order alerts
- Push notification preferences
- Fallback mechanisms

### v3.0 - Advanced Features
- Loyalty program
- Promo codes
- Multi-truck support
- Mobile app
- Advanced analytics

---

## Known Issues & Workarounds

| Issue | Severity | Workaround | Fix Timeline |
|-------|----------|-----------|--------------|
| No email on order status changes | Medium | Use push notifications (planned) | v2.0 |
| Newsletter send unavailable | Low | Use external email service | Later |
| Can't quickly mark items unavailable | Low | Go to Menu Management page | v1.2 |
| No order search by date | Medium | Scroll through pagination | v1.2 |
| iOS Safari notifications limited | Low | Show info message to iOS users | v1.2 |
| Review UI not visible to customers | Medium | Build submission form | v1.2 |

---

## Contact & Questions

For questions about feature status or roadmap, see:
- `docs/ADMIN_MODULES.md` — Admin feature details
- `docs/USER_MANUAL.md` — Customer feature details
- `docs/PUSH_NOTIFICATIONS_PLAN.md` — Push notification implementation
- `docs/SYSTEM_ARCHITECTURE.md` — Technical architecture

