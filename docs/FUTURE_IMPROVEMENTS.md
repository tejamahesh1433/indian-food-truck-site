# Project Roadmap & Future Improvements

This document serves as a living audit and roadmap for the Indian Food Truck Management System. It tracks functional gaps, priority features, and the "wow" factor improvements.

---

## ✅ VERIFIED DONE

- [x] **Real-time Kitchen Polling**: Kanban-style dashboard with 8-second auto-refresh.
- [x] **Order-level Special Instructions**: Chef's notes field in Cart and Kitchen view.
- [x] **Guest Checkout**: Customers can order without requiring an account.
- [x] **Forgot Password Flow**: Secure email-based reset logic with token validation.
- [x] **Mobile Responsive Dashboards**: Polished layouts for Profile, Invoice, and Admin settings.
- [x] **Promo & Discount Codes**: Full management UI, Zod validation, and Stripe integration.
- [x] **Admin Support Chat Visibility**: Real-time unread badges in the sidebar and chat list.
- [x] **Kitchen Display Audio Alerts**: Physics-based "Ding" notification for new incoming orders.
- [x] **Wait Time Estimation**: Dynamic "Ready in XX mins" calculation based on live kitchen load.
- [x] **Live Truck Map Integration**: Precision GPS-based pin on the homepage with live status indicator.
- [x] **Inventory "Low Stock" Alerts**: Automated admin alerts when stock drops below a configurable threshold.

---

## 🔴 HIGH PRIORITY (Functional Gaps)

(No critical gaps remaining in this category!)

---

## 🟡 MEDIUM PRIORITY (Polish & UX)

1. **Post-Order Review Nudge**
    - **Goal**: Automated email or in-app pop-up once an order is marked `COMPLETED`, nudging the customer to use the `ReviewModal.tsx`.
2. **Loyalty / Digital Punch-Card**
    - **Goal**: Implement a "Buy 10, Get 1 Free" or points-based reward system for repeat customers.

---

## 🟢 LOWER PRIORITY (The "Wow" Factor)

---

## 🔐 Security & Infrastructure

- [ ] **Email Verification**: Mandatory verification at signup.
- [ ] **CAPTCHA**: Bot protection on catering and signup forms.
- [ ] **Audit Logs**: History of admin changes for accountability.
