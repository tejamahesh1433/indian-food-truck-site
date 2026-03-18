# User Manual

This manual covers how to use the site as a customer and how to manage the food truck as an admin.

---

## 👤 Customer Guide

### Creating an Account

1. Click **"Sign In"** in the navigation bar, then select **"Create Account"**.
2. Enter your name, email, and a password (minimum 6 characters).
3. You will be signed in automatically and redirected to the homepage.

Having an account lets you view your full order history in your profile.

---

### Exploring the Menu

1. Click **"Menu"** in the navigation bar.
2. Browse by category using the tabs at the top.
3. Look for badges: 🌿 **Veg**, 🌶 **Spicy**, ⭐ **Popular**.
4. Click **"Add to Cart"** on any item you want to order.

---

### Placing an Order

1. Add items to your cart — the cart icon in the navbar shows your current total.
2. Click the cart icon to open the **Cart Drawer**.
3. Review your items, subtotal, and tax (6.35% CT Sales Tax applied automatically).
4. Click **"Checkout"**.
5. Fill in your name, email, and phone number.
6. Enter your card details in the secure Stripe payment form.
7. Click **"Pay"** to complete the order.
8. You will be redirected to the **Order Success** page.
9. A confirmation email is sent to you with your order details and a tracking link.

---

### Tracking Your Order

1. Click the tracking link in your confirmation email, or go to `/track/[your-token]`.
2. You can see the live status of your order: **Paid → Preparing → Ready → Completed**.
3. Use the chat section to send a message to the truck owner (e.g., about pickup timing or special requests).

---

### Ordering Catering (Professional Flow)

1. Navigate to the **"Catering"** page from the navbar.
2. Browse catering items by category.
3. Click an item to open the **Customization Drawer**.
   - Choose "Half Tray" (feeds 10–15) or "Full Tray" (feeds 25–30) for tray items.
   - For per-person packages, specify your guest count.
4. Review your **Selection Summary** at the bottom of the screen.
5. Fill in the event inquiry form — your name, phone, email, event date, guest count, and location.
6. Submit the form.
7. You will receive an email with a unique **chat link**. Click it to discuss pricing, logistics, and finalize your booking directly with the owner.

---

### Viewing Your Order History

1. Click your name / profile icon in the navigation bar.
2. Your profile page shows all past orders with items, totals, and statuses.
3. Click **"Track Order"** on any order to re-open the tracking page.

---

### Finding the Truck

The **homepage** shows:
- **Today's Status** — whether the truck is open, closed, or on the way.
- **Today's Location** — current stop address with a Google Maps link.
- **Next Stop** — upcoming location and time so you can plan ahead.

---

## 🔐 Administrative Guide

### Accessing the Dashboard

1. Go to `/truckadmin/login`
2. Enter the admin password.
3. You will be redirected to the **Admin Dashboard** at `/admin`.

---

### Managing Orders

1. Go to **Orders** in the admin sidebar.
2. New paid orders appear at the top.
3. Click an order to view details — customer info, items ordered, total, and time.
4. Use the **Status** selector to move the order through: `Preparing` → `Ready` → `Completed`.
5. Click **"Chat"** to open a message thread with the customer.

You also receive an **email notification** for every new paid order.

---

### Managing the Menu

1. Go to **Menu Items** in the admin sidebar.
2. Click the **"+"** button to add a new item — enter name, description, price, category, and dietary tags.
3. Click any item to edit it.
4. Use the **availability toggle** to instantly hide items from the public menu without deleting them.
5. Mark items as **Popular** to feature them in the "Signature Dishes" homepage section.
6. Drag items to reorder how they appear on the menu.

---

### Updating the Truck Schedule

1. Go to **Locations** in the admin sidebar.
2. Set **Today's Status** (Open / Closed).
3. Enter today's location, opening time, closing time, and any notes.
4. Set the **Next Stop** details for your upcoming deployment.
5. Use **Saved Locations** to pick a preset address instead of typing it manually.
6. Save — changes appear on the homepage immediately.

---

### Managing Catering Requests

1. Go to **Catering** in the admin sidebar.
2. New requests show with a **NEW** badge.
3. Click a request to view the event details and item selections.
4. Use the **Chat** tab to send a message — the customer receives it via their unique link.
5. Update the status to `CONTACTED` when you've started the conversation, and `DONE` when the booking is confirmed.
6. Use **Internal Notes** for private reminders not visible to the customer.

---

### Configuring Site Settings

1. Go to **Settings** in the admin sidebar.
2. Update business name, phone, public email, Instagram URL, and logo.
3. Toggle the **Announcement Banner** on/off and set the banner text.
4. Toggle **Catering Enabled** off if you are fully booked.
5. Set the **Admin Access PIN** to require a PIN before customers can browse the site (useful for soft launches).
6. Save all changes — they apply site-wide immediately.
