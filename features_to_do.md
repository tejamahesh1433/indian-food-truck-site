# 🔴 High Priority — Functional gaps & Operational needs

**1. No Promo/Discount Code system** — There is no ability to offer discount codes (e.g., "TRUCK10"). This requires a new `PromoCode` model, a validation API, and a UI field in the Cart/Checkout.

**2. Kitchen Display: No Audio Alerts** — While the kitchen display auto-refreshes, there is no sound notification when a new order arrives. Chefs need an audible "Ding" to know an order is in without staring at the screen.

**3. Admin Sidebar: No Support Chat Unread Badges** — The unread count API exists, but the badges are not integrated into the main admin sidebar. The admin has to manually check the support page for new messages.

**4. Social Login (Google/Facebook)** — The database models support social accounts, but `auth.ts` is only configured for Credentials and the Login UI is missing the social buttons.

**5. Order "Cancel & Refund" for Admin** — While customers can self-cancel, the Admin needs a one-click button to cancel an order AND trigger the Stripe refund automatically from the dashboard.

---

## 🟡 Medium Priority — Polish and Engagement

**6. Automated Review Prompt** — When an order status is changed to `COMPLETED`, there is no automated nudge (email or tracking page pop-up) to ask the customer for a review.

**7. Loyalty / Digital Punch-Card** — No system to reward frequent customers (e.g., "Buy 10, Get 1 Free"). This was a roadmap item that is still outstanding.

**8. Dynamic Wait Time Estimation** — Customers don't see an estimated prep time. This could be calculated based on the number of active orders in the kitchen.

**9. Real-time Support Chat "Typing" Indicators** — The support chat uses polling, but lacks "Typing..." indicators or read receipts for a premium feel.

---

## 🟢 Lower Priority — Long-term Analytics & Operations

**10. Integrated Truck Map** — The homepage uses text for location. A live Google/Apple Maps integration showing the truck's precise GPS location (or pinned location) would be a major upgrade.

**11. Low Stock Alerts** — Automated email notifications to admin when a menu item's `stockCount` drops below a certain threshold (e.g., 5 items left).

**12. Analytics: CSV/PDF Export for All Sections** — While newsletter subscribers can be exported, other analytics (orders, catering performance) lack a "Download Report" button for bookkeeping.

**13. Multi-Truck Support** — If the business expands to a second truck, the settings/orders logic would currently need significant refactoring.

