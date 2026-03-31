# Future Improvements

To further enhance the **Indian Food Truck Management System**, the following roadmap is proposed.

---

## ✅ Completed Features (Previously Planned)

### Phase 4: Order & Logistics — DONE
* ~~**Online Food Ordering**~~: Direct-to-truck ordering is fully implemented with cart, checkout, and order tracking.
* ~~**Payment Integration**~~: Stripe Payment Intents with Apple Pay / Google Pay support via Stripe Elements.
* ~~**Order Tracking**~~: Real-time status page with customer-admin chat channel.

### Phase 5: Customer Retention — DONE
* ~~**Customer Accounts**~~: Full sign-up/login flow with order history in profile page.

### Phase 6A: Kitchen Operations & Analytics — DONE
* ~~**Live Kitchen Display System**~~: Real-time auto-refreshing (8-sec polling) Kanban-style order board with NEW → PREPARING → READY columns.
* ~~**Order Pagination**~~: Historical orders pagination with 15 items per page and page numbers (supports up to 1000s of orders).
* ~~**Sales Analytics Dashboard**~~: Revenue tracking, top items, order trends, 7 date range options (Today/Week/Month/7d/30d/90d/AllTime) with comparison metrics and best-day highlights.
* ~~**Order Notes**~~: Special instructions per item and per order (e.g., "no onions", allergen warnings).
* ~~**Display Order Notes in Kitchen**~~: Notes shown in admin orders view for chef reference.

### Phase 5B: Security & Authentication — DONE
* ~~**Forgot Password**~~: Email-based password reset flow with token expiration.
* ~~**Password Reset**~~: Secure token validation and password update.
* ~~**Order Cancellation Window**~~: Customers can cancel orders within 15 seconds of placement.

### Phase 5C: Customer Reviews — DONE (Backend + Partial UI)
* ~~**Reviews System**~~: Backend database schema for menu-item and order-based reviews with approval workflow.
* ~~**Admin Review Moderation**~~: Admin dashboard to approve/reject/delete customer reviews before they appear on site.
* ~~**Approved Reviews Display**~~: Reviews section on homepage showing approved customer feedback.
* **Customer Review Submission UI** [Pending]: Form component + links from order tracking/profile (infrastructure ready, UI implementation pending).

---

## 🚧 Phase 6B: Advanced Order Management

* **Order Search & Filter**: Filter orders by status (PAID, PREPARING, READY, COMPLETED), date range (Today/Week/Month), customer name, phone, or email.
* **Quick Item Availability Toggle**: One-click "86 this item" button from kitchen display to mark menu items unavailable without navigating to menu management.
* **Menu Item Reservation System** [Optional]: Allow menu items to be reserved per order to prevent overselling.

---

## 📱 Phase 7: Notifications & Engagement

* **Email Marketing**: Newsletter send functionality (admin can compose and send to all subscribers). Currently blocked by free email service limitations.
* **Push Notifications**: Browser push notifications (via web push API) for order updates — includes comprehensive plan in `/docs/PUSH_NOTIFICATIONS_PLAN.md`.
* **Admin Alerts**: Real-time browser/email notifications when new orders arrive or require attention.
* **SMS Notifications** [Future]: Automated Twilio alerts for order status changes (requires Twilio integration).
* **Email Status Notifications** [Future]: Transactional emails on order status changes (PREPARING, READY, COMPLETED) — requires upgrading email service from free tier.

---

## 🎯 Phase 8: Customer Loyalty

* **Loyalty Program**: Digital punch-card or points-based rewards for repeat customers.
* **Promo Codes**: Discount code system managed from the admin panel.
* **Referral System**: Share a link to get a discount on your next order.

---

## 🏗 Phase 9: Scalability

* **Multi-Truck Support**: Manage multiple trucks from a single dashboard with per-truck menus and schedules.
* **Franchise Mode**: Allow multiple admin users with role-based permissions (owner vs. staff).
* **Mobile App**: React Native app for staff to manage orders from a mobile device at the truck.

---

## 🔐 Phase 10: Security & Infrastructure

* **Email Verification**: Verify customer email addresses at sign-up to prevent fake accounts.
* **CAPTCHA**: Bot protection on the signup and catering submission forms.
* **Enhanced Password Policy**: Enforce minimum complexity rules (uppercase, numbers, special characters).
* **Audit Logs**: Admin action history for accountability.
