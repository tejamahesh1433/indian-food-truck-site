# Admin Modules

## Accessing the Admin Dashboard

1. Go to `/truckadmin/login`
2. Enter the secure admin password
3. You will be redirected to `/admin` — the main dashboard

The admin session is secured with a JWT cookie (7-day expiry), database-backed rate limiting (5 login attempts per 15 minutes), and timing-safe password comparison.

---

## Dashboard Overview

The dashboard provides a centralized interface for managing all system modules.

Modules:

* **Orders**: View and manage all incoming paid orders, update statuses, and chat with customers.
* **Menu Management**: Full CRUD for daily food truck menu items.
* **Catering Requests**: Live inbox for managing catering quotes and customer communication.
* **Catering Menu**: Manage the professional bulk-order catering menu (items and categories).
* **Truck Schedule**: Real-time updates for "Today's Stop" and "Next Stop".
* **Saved Locations**: Maintain a library of frequently used truck locations.
* **Site Settings**: Global branding, contact information, and feature toggles.

---

## Module 1: Orders

The orders dashboard shows all paid orders from customers.

Functions:
* View incoming orders with customer name, items, total, and timestamp.
* Update order status through the lifecycle: `PAID` → `PREPARING` → `READY` → `COMPLETED` (or `CANCELLED`).
* Open the order chat to communicate directly with the customer in real time.
* Admin receives an email notification for every new paid order (sent to the `publicEmail` or `ADMIN_EMAIL` env var).

---

## Module 2: Menu Management

Functions:
* Add new menu items with tags (Veg, Spicy, Popular) and category assignment.
* Edit existing names, descriptions, prices, and images.
* Toggle **In Stock / Out of Stock** — items marked out of stock are hidden from the public menu immediately.
* Mark items as **Popular** to feature them in the "Signature Dishes" homepage section.
* Drag-and-drop reordering to control display sequence.
* Bulk operations for creating or updating multiple items at once.

---

## Module 3: Catering Requests (Inbox)

Functions:
* New submissions appear at the top sorted by date.
* Status tracking: `NEW` → `CONTACTED` → `DONE`.
* Click any request to open the details drawer — view event info, guest count, and item selections.
* Open the chat thread to send messages directly to the customer (they receive and reply via their unique chat link).
* Archive requests to keep the inbox clean without deleting records.
* Internal notes field for private comments not visible to the customer.

---

## Module 4: Catering Menu

Functions:
* Manage items and categories for the professional catering selection page.
* Set pricing type: `PER_PERSON`, `TRAY` (with half/full pricing), or `FIXED`.
* Set `minPeople` for package items that require a minimum group size.
* Toggle availability and control display order.

---

## Module 5: Truck Schedule Manager

Functions:
* Set **Today's Status** (`OPEN` / `CLOSED`) for the current day.
* Update today's location, start time, end time, and notes.
* Set **Next Stop** details for upcoming deployment.
* Pick from **Saved Locations** to auto-fill addresses quickly.
* Changes reflect immediately on the customer-facing homepage and footer.

---

## Module 6: Saved Locations

Functions:
* Create a library of frequently visited locations with names and full addresses.
* Select saved locations in the Schedule Manager for quick updates.
* Add and remove locations as the truck's regular spots change.

---

## Module 7: Site Settings

Functions:
* **Business Info**: Update business name, city/state, public email, phone number, and Instagram URL.
* **Logo**: Set the logo URL displayed in the navbar and footer.
* **Footer Message**: Custom message shown in the footer.
* **Announcement Banner**: Enable a site-wide banner with custom text for holidays, price changes, or special events.
* **Catering Toggle**: Disable catering submissions entirely when fully booked. Customers will see a "Currently Unavailable" message.
* **Access PIN**: Set a 6-digit PIN to gate the entire public-facing site (useful for soft launches or private demos).
* **Weekly Schedule**: Configure recurring weekly schedule displayed to customers.
