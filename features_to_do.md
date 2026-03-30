# 🔴 High Priority — Real functional gaps

**1. No "Forgot Password" flow** — The login page has no password reset option. Any user who forgets their password is permanently locked out with no way to recover.

**2. Admin kitchen orders: No auto-refresh / real-time polling** — The kitchen display (`/admin/orders`) is a static server-rendered page. A new order coming in requires a full manual page reload to appear. For a live truck, this is a serious gap.

**3. No order-level special instructions** — Customers can't type notes like "no onions," "extra spicy," or allergen warnings anywhere on the cart or checkout page. There's no `notes` field on the `Order` model either.

**4. No email notifications to customers for order status changes** — The `mail.ts` lib exists in the project, but there's no email sent when an order becomes PREPARING, READY, or COMPLETED. Customers have to track manually via the tracking URL.

**5. No admin alert when a new order arrives** — Admin has to sit on the orders page or manually reload. No email ping, no sound, no browser notification.

**6. Admin orders: No filter or search** — All orders load in one big list with no way to filter by status (show only PAID ones), by date (show today's only), or search by customer name/phone/order ID.

---

# 🟡 Medium Priority — Noticeable missing pieces

**7. Invoice not linked from profile** — The `/invoice/[id]` page exists and the admin has a "Print Invoice" button — but customers have zero way to access it from their order history. No download receipt button on the profile page.

**8. Newsletter: Can view/export but can't send** — The newsletter admin shows subscribers and exports CSV, but there's no "compose and send" functionality. You'd need to paste emails into Mailchimp etc. manually.

**9. No "Cancel Order" for customers** — A customer who places an order and immediately wants to cancel has no self-serve option. Only the admin can change status. This will generate support chat volume.

**10. No admin notification badge for new support messages** — The dashboard shows "N ACTIVE" total chats, but once you've opened support chat admin, there's no unread indicator on individual conversations.

**11. Analytics covers online orders only** — Catering revenue is quote-based so exact amounts aren't tracked, but catering request counts, conversion rates (NEW → CONFIRMED), and response times could be shown in analytics. Right now the analytics page is blind to that entire side of the business.

**12. Admin orders: No pagination** — 500+ orders will all load on a single page. No page limit or "Load more."

---

# 🟢 Lower Priority — Polish and nice-to-haves

**13. No promo/discount codes** — Listed in the roadmap. No coupon system, no ability to offer a "TRUCK10" code at events.

**14. No review prompt after order completion** — When an order is marked COMPLETED, no email or link nudges the customer to leave a review. The review form exists on the site but customers have to find it themselves.

**15. Password strength not enforced** — Signup accepts "123456" as a valid password with no minimum complexity requirements.

**16. No email verification on signup** — Users can register with typo emails or fake addresses with no verification step. Listed in roadmap under Phase 10.

**17. Checkout has no Terms/Privacy links** — Standard practice to link ToS and Privacy Policy on the payment screen.

**18. No "quick availability toggle" on the orders page** — If Butter Chicken sells out mid-service, admin has to navigate to Menu Management → find the item → toggle availability. No quick "86 this item" button from the kitchen view.

**19. Guest checkout** — Currently requires a full account to place an order. This adds friction; some customers will abandon.

**20. No loyalty/punch-card system** — Roadmap item, not built.
