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

* **Live Kitchen Display**: Real-time auto-refreshing Kanban board for active orders (NEW | PREPARING | READY).
* **Orders History**: Browse, paginate, and view historical orders with full details and special instructions.
* **Menu Management**: Full CRUD for daily food truck menu items.
* **Catering Requests**: Live inbox for managing catering quotes and customer communication.
* **Catering Menu**: Manage the professional bulk-order catering menu (items and categories).
* **Sales Analytics**: Revenue, top items, order trends, and operational insights (7 date ranges).
* **Truck Schedule**: Real-time updates for "Today's Stop" and "Next Stop", with weekly recurring schedule.
* **Saved Locations**: Maintain a library of frequently used truck locations.
* **Site Settings**: Global branding, contact information, and feature toggles.
* **Customer Reviews**: Moderation dashboard to approve/reject reviews before they appear on site.
* **Newsletter Subscribers**: View and export email subscriber list (send functionality pending).
* **Support Chat**: Respond to customer inquiries via the help widget.

---

## Module 1: Live Kitchen Display System

The live kitchen display provides a real-time auto-refreshing Kanban board for managing active orders.

Functions:
* **Three columns**: NEW (PAID/PENDING) | PREPARING | READY — drag-like visual grouping.
* **Auto-refresh**: Orders update every 8 seconds without manual refresh.
* **Live indicator**: Green pulsing dot confirms active sync.
* **Order cards**: Show order number, customer name, total, item count, items list, and timestamp.
* **Quick actions**: Update status, open chat, view invoice.
* **Visual status**: Color-coded badges (red = NEW, blue = PREPARING, orange = READY).

---

## Module 1B: Order History & Pagination

The historical orders view lets admins browse past orders with pagination and full details.

Functions:
* **Pagination**: 15 items per page with numbered page navigation.
* **Special instructions display**: Order-level notes (e.g., "allergic to X") shown in orange banner.
* **Per-item notes**: Individual item instructions (e.g., "no onions") shown below each line item.
* **Lifetime order count**: Total cumulative orders displayed in page header.
* **Customer contact**: Phone number and email for each order visible.
* **Invoice link**: Print button opens invoice in new tab.
* **Status color coding**: Visual badges for PAID, PREPARING, READY, COMPLETED, CANCELLED.

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

---

## Module 8: Sales Analytics

The analytics dashboard provides revenue, order, and operational insights with multiple date range views.

Functions:
* **7 Date Ranges**: Today | This Week | This Month | Last 7 Days | Last 30 Days | Last 90 Days | All Time
* **KPI Cards**: Revenue, total orders, average order value, items sold, completed revenue, cancellation rate with comparison % and "was $X" previous period
* **Quick Insights Banner**: Best day, cancellation rate, peak hour, peak day for selected period
* **Daily Trend Chart**: Revenue by day with best-day star highlight, active days count, hover tooltips
* **Top Items Table**: Top 10 menu items per period with quantity, revenue, % of sales
* **Order Breakdown**: Status distribution (PENDING, PAID, PREPARING, READY, COMPLETED, CANCELLED) with horizontal % bars
* **Peak Hours & Days**: Side-by-side views with order/revenue toggle and "busiest: X" callouts
* **Export to CSV**: Download daily revenue data for accounting/analysis

---

## Module 9: Customer Reviews

The review moderation dashboard allows admins to control which reviews appear on the site.

Functions:
* **Approval workflow**: All new reviews start as "Pending" and must be approved before display.
* **Review list**: See reviewer name, rating (⭐), comment, approval status, and submission date.
* **Bulk actions**: Approve, reject, or delete multiple reviews at once.
* **Filter by status**: Show pending, approved, or rejected reviews.
* **Live preview**: Approved reviews appear on the homepage in the "Reviews" section.
* **Search**: Filter by reviewer name, menu item, or order ID (if tied to an order).

---

## Module 10: Newsletter Subscribers

The newsletter module lets admins manage the email subscriber list.

Functions:
* **Subscriber list**: See email, name, and signup date for each subscriber.
* **Export to CSV**: Download all subscribers for use in external email services (Mailchimp, etc.).
* **Remove subscriber**: Delete individual subscribers or manage bounced addresses.
* **Subscriber count**: Dashboard widget shows total active subscribers.
* **Send functionality** [Pending]: Requires email service upgrade from free tier to support transactional email blasts.

---

## Module 11: Support Chat

The support chat module lets admins respond to customer inquiries from the help widget.

Functions:
* **Chat list**: See all active and archived support conversations.
* **Customer inquiries**: Customers contact via the support widget on the site.
* **Real-time messaging**: Reply directly to customer questions.
* **Conversation history**: All past messages visible in thread view.
* **Archive**: Mark conversations as resolved to keep inbox clean.
* **Notification indicator**: Dashboard badge shows count of active chats.

---

## Module 12: Today's Special

Quick-update module for featuring a daily special dish on the homepage.

Functions:
* **Daily feature**: Set one special dish to highlight each day.
* **Edit details**: Update name, description, price, image, and dietary tags (Veg, Spicy, Popular).
* **Toggle active**: Quickly enable/disable the special (e.g., when sold out).
* **Homepage integration**: Featured prominently on the home page below the hero section.
