# API Reference

This document provides a technical specification for all REST endpoints in the Indian Food Truck Management System.

---

## Public Endpoints

### Menu & Settings

**`GET /api/menu-items`**
Fetches all available menu items for the public menu page.
- **Query Params**: `category`, `veg`, `spicy`, `popular`
- **Response**: `{ "ok": true, "items": [...] }`

**`GET /api/categories`**
Fetches all menu categories.
- **Response**: `{ "categories": [...] }`

**`GET /api/catering-menu`**
Fetches catering categories and items for the selection drawer.
- **Response**: `{ "categories": [...], "items": [...] }`

**`GET /api/settings`**
Fetches public site settings (branding, truck status, contact info). Strips sensitive fields like `adminAccessPin`.
- **Response**: `{ "settings": { "businessName": "...", "todayStatus": "...", ... } }`

---

### Authentication (Customer)

**`POST /api/auth/signup`**
Registers a new customer account.
- **Payload**: `{ "name": "string", "email": "string", "password": "string (min 6 chars)" }`
- **Responses**:
  - `201 Created`: `{ "message": "Account created successfully" }`
  - `400 Bad Request`: Validation error or duplicate email
  - `500 Internal Server Error`: Server error

**`GET/POST /api/auth/[...nextauth]`**
Handled by NextAuth.js. Manages sign-in, sign-out, session, and callback routes.

---

### Orders & Checkout

**`POST /api/orders`**
Creates a new order and Stripe PaymentIntent. Prices are verified server-side against the database.
- **Payload**:
  ```json
  {
    "customerName": "string",
    "customerEmail": "string",
    "customerPhone": "string",
    "items": [{ "id": "string", "name": "string", "priceCents": 0, "quantity": 1 }]
  }
  ```
- **Responses**:
  - `200 OK`: `{ "clientSecret": "...", "orderId": "...", "totalAmount": 0, "subtotalAmount": 0, "taxAmount": 0 }`
  - `400 Bad Request`: Validation error or unavailable item
  - `409 Conflict`: Duplicate order within 10 seconds

**`GET /api/orders/track/[token]`**
Fetches order status and details by tracking token (public, no auth required).
- **Response**: `{ "order": { "status": "...", "items": [...], ... } }`

**`GET /api/orders/[id]/messages`**
Fetches order chat messages by order ID (requires valid chat token in header).

**`POST /api/orders/[id]/messages`**
Posts a customer message to an order chat thread.

**`GET /api/chat/[token]/messages`**
Fetches the full message history for a catering inquiry by token.

**`POST /api/chat/[token]/messages`**
Posts a message to a catering chat thread (customer via token or admin via cookie).

---

### Catering

**`POST /api/catering`**
Submits a new catering request.
- **Payload**:
  ```json
  {
    "name": "string",
    "phone": "string",
    "email": "string",
    "eventDate": "string (optional)",
    "guests": "string (optional)",
    "location": "string (optional)",
    "notes": "string (optional)",
    "selections": "Array (optional)"
  }
  ```
- **Responses**:
  - `200 OK`: `{ "ok": true, "chatToken": "..." }`
  - `400 Bad Request`: `{ "ok": false, "error": "Invalid form data" }`
  - `429 Too Many Requests`: Rate limit triggered (3 per 15 mins per IP)
  - `503 Service Unavailable`: Catering is disabled in Site Settings

---

### User (Authenticated)

**`GET /api/user/orders`**
Fetches all orders for the currently authenticated user.
- **Auth**: Requires active NextAuth session
- **Response**: Array of orders with items

---

### Access Gate

**`POST /api/verify-pin`**
Verifies the site access PIN (for PIN-gated public access). Rate limited to 5 attempts per 15 minutes per IP.
- **Payload**: `{ "pin": "string" }`
- **Responses**:
  - `200 OK`: `{ "success": true }`
  - `401 Unauthorized`: `{ "error": "Invalid access code" }`
  - `429 Too Many Requests`: Rate limit exceeded
  - `500 Internal Server Error`: PIN not configured

---

### Stripe Webhook

**`POST /api/webhooks/stripe`**
Receives and processes Stripe webhook events. Validates the webhook signature before processing.
- **Events handled**:
  - `payment_intent.succeeded` — marks order as PAID, sends customer confirmation email, sends admin notification email
  - `checkout.session.completed` — same fulfillment flow
- **Security**: Signature verified via `stripe.webhooks.constructEvent`

---

## Admin Endpoints (Protected)

All admin endpoints require a valid `admin_token` JWT cookie set at login. Protected by `middleware.ts`.

### Authentication

**`POST /api/admin/login`**
Authenticates the admin and sets a secure HTTP-only JWT cookie. Rate limited to 5 attempts per 15 minutes per IP (database-backed).
- **Payload**: `{ "password": "string" }`
- **Response**: `{ "ok": true }` — sets `admin_token` cookie

**`POST /api/admin/logout`**
Clears the admin authentication cookie.
- **Response**: `{ "ok": true }`

---

### Orders (Admin)

**`GET /api/admin/orders`**
Fetches all orders with items and messages for the admin dashboard (via Server Action).

**`PATCH /api/admin/orders/[id]`**
Updates order status.
- **Payload**: `{ "status": "PREPARING | READY | COMPLETED | CANCELLED" }`

**`GET /api/admin/catering/[id]/messages`**
Fetches catering messages for a specific request.

**`POST /api/admin/catering/[id]/messages`**
Sends an admin message to a catering thread.
- **Payload**: `{ "text": "string (max 1000 chars)" }`

---

### Menu Management

**`GET /api/admin/menu-items`**
Fetches all menu items with advanced filtering for the admin dashboard.
- **Query Params**: `q`, `category`, `available`, `orderBy`

**`POST /api/admin/menu-items`**
Creates a new menu item.

**`PUT /api/admin/menu-items/[id]`**
Updates an existing menu item.

**`DELETE /api/admin/menu-items/[id]`**
Deletes a menu item and triggers Next.js cache revalidation for the public menu.

**`PATCH /api/admin/menu-items/reorder`**
Updates the `sortOrder` of multiple items in bulk.

**`POST /api/admin/menu-items/bulk`**
Bulk creates or updates menu items.

---

### Menu Categories

**`GET /api/admin/menu-categories`**
Fetches all menu categories.

**`POST /api/admin/menu-categories`**
Creates a new category.

**`PUT /api/admin/menu-categories/[id]`**
Updates a category.

**`DELETE /api/admin/menu-categories/[id]`**
Deletes a category.

---

### Catering Management

**`GET /api/admin/catering`**
Fetches all catering requests.

**`PATCH /api/admin/catering`**
Updates the status of a catering request.
- **Payload**: `{ "id": "string", "status": "CONTACTED | DONE" }`

**`GET/POST/PUT/DELETE /api/admin/catering-items`**
Full CRUD for catering menu items.

**`GET/POST/PUT/DELETE /api/admin/catering-categories`**
Full CRUD for catering categories.

**`PATCH /api/admin/catering-items/reorder`**
Reorders catering items.

---

### Saved Locations

**`GET /api/admin/saved-locations`**
Fetches all saved truck locations.

**`POST /api/admin/saved-locations`**
Creates a new saved location.

**`DELETE /api/admin/saved-locations/[id]`**
Deletes a saved location.

---

### Site Settings

**`GET /api/admin/settings`**
Fetches full site settings including sensitive fields (admin only).

**`POST /api/admin/settings`**
Updates global site configuration.
- **Payload**: `{ "businessName": "...", "cateringEnabled": true, "bannerEnabled": false, ... }`
