# API Reference

This document provides a technical specification for all REST endpoints available in the Indian Food Truck Management System.

---

## Public Endpoints

### 1. Catering Submission
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
    "selections": "Array<any> (optional)"
  }
  ```
- **Responses**:
    - `200 OK`: `{ "ok": true, "chatToken": "..." }`
    - `400 Bad Request`: `{ "ok": false, "error": "Invalid form data" }`
    - `429 Too Many Requests`: Rate limit triggered (3 per 15 mins per IP).
    - `503 Service Unavailable`: Catering is disabled in Site Settings.

### 2. Full Menu (Public)
**`GET /api/menu-items`**
Fetches all available menu items for the public menu page.
- **Query Params**: `category`, `veg`, `spicy`, `popular`.
- **Response**: `{ "ok": true, "items": [...] }`

### 3. Catering Menu (Professional)
**`GET /api/catering-menu`**
Fetches categories and items for the catering selection drawer.
- **Response**: `{ "categories": [...], "items": [...] }`

---

## Admin Endpoints (Protected)
*Most admin endpoints require the `auth_token` cookie.*

### 1. Authentication
**`POST /api/admin/login`**
Authenticates the owner and sets a secure HTTP-only cookie.
- **Payload**: `{ "password": "..." }`
- **Response**: `{ "ok": true }` (Sets `auth_token`)

**`POST /api/admin/logout`**
Clears the authentication cookie.
- **Response**: `{ "ok": true }`

### 2. Menu Item Management
**`GET /api/admin/menu-items`**
Advanced filtering and sorting for the admin dashboard.
- **Query Params**: `q`, `category`, `available`, `orderBy`.

**`POST /api/admin/menu-items`**
Creates a new menu item.
- **Payload**: `{ "name": "...", "price": 12.50, ... }`

**`DELETE /api/admin/menu-items/[id]`**
Hard deletes a menu item and triggers Next.js cache revalidation for the public menu.

### 3. Catering Inbox
**`GET /api/admin/catering`**
Fetches all catering requests sorted by date.

**`PATCH /api/admin/catering`**
Updates the status of a request (e.g., "CONTACTED", "DONE").
- **Payload**: `{ "id": "...", "status": "..." }`

### 4. Site Settings
**`POST /api/admin/settings`**
Updates global truck configuration.
- **Payload**: `{ "businessName": "...", "cateringEnabled": true, ... }`

---

## Chat API (Token-Based)
**`GET /api/chat/[token]/messages`**
Fetches the message history for a specific catering inquiry.

**`POST /api/chat/[token]/messages`**
Allows either the customer (via token) or admin (via session) to post a message.
