# Database Design

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Order : "places"
    User ||--o{ Account : "has"
    User ||--o{ Session : "has"
    User ||--o{ Review : "writes"
    Order ||--o{ OrderItem : "contains"
    Order ||--o{ OrderMessage : "has"
    Order ||--o{ Review : "has"
    MenuItem ||--o{ Review : "has"
    CateringRequest ||--o{ CateringMessage : "has"
    MenuItem }|--|| MenuCategory : "categorised_by"
    CateringItem }|--|| CateringCategory : "categorised_by"

    User {
        string id PK
        string name
        string email "Unique"
        string password "bcrypt hashed"
        datetime emailVerified
        datetime createdAt
    }

    Order {
        string id PK
        string userId FK "Optional - links to User"
        string customerName
        string customerEmail
        string customerPhone
        int subtotalAmount "In cents"
        int taxAmount "In cents"
        int totalAmount "In cents"
        enum status "PENDING|PAID|PREPARING|READY|COMPLETED|CANCELLED"
        string stripeSessionId "Stripe PaymentIntent ID"
        string chatToken "Unique - for order tracking"
        string notes "Optional special instructions for entire order"
        datetime createdAt
        datetime updatedAt
    }

    OrderItem {
        string id PK
        string orderId FK
        string menuItemId
        string name "Snapshot at time of order"
        int quantity
        int priceCents "Snapshot at time of order"
        string notes "Optional per-item special instructions (e.g., 'no onions')"
    }

    OrderMessage {
        string id PK
        string orderId FK
        enum sender "CUSTOMER | ADMIN"
        string text
        datetime createdAt
    }

    CateringRequest {
        string id PK
        string name
        string email
        string phone
        string status "NEW | CONTACTED | DONE"
        boolean isArchived
        string chatToken "Unique access key"
        json selections "Array of item selections"
        datetime createdAt
    }

    CateringMessage {
        string id PK
        string requestId FK
        enum sender "CUSTOMER | ADMIN"
        string text
        datetime createdAt
    }

    MenuItem {
        string id PK
        string name
        int priceCents "Price in integer cents"
        string category
        boolean isVeg
        boolean isSpicy
        boolean isPopular
        boolean isAvailable
        boolean inPos
        int sortOrder
    }

    CateringItem {
        string id PK
        string name
        string priceKind "PER_PERSON | TRAY | FIXED"
        float halfPrice
        float fullPrice
        int minPeople
        boolean isAvailable
        int sortOrder
    }

    SiteSettings {
        string id PK "Always 'global'"
        string businessName
        string phone
        string publicEmail
        string instagramUrl
        boolean cateringEnabled
        boolean bannerEnabled
        string bannerText
        string todayStatus "OPEN | CLOSED"
        string todayLocation
        string todayStart
        string todayEnd
        string nextLocation
        string nextStart
        string nextEnd
        string adminAccessPin
        string logoUrl
        json weeklySchedule
    }

    SavedLocation {
        string id PK
        string name "Label"
        string address
    }

    AdminLoginAttempt {
        string id PK
        string ip "IP address or pin_IP for PIN attempts"
        int count
        datetime expiresAt
    }

    Review {
        string id PK
        string orderId FK "Optional - if review tied to order"
        string menuItemId FK "Optional - if review for menu item"
        string userId FK "Optional - if logged-in user submitting"
        string name "Reviewer name (always shown)"
        int rating "1-5 star rating"
        string text "Review comment"
        boolean isApproved "Admin must approve before display"
        datetime createdAt
    }

    PasswordResetToken {
        string id PK
        string email
        string token "Unique reset token"
        datetime expiresAt
        datetime createdAt
    }
```

---

## Detailed Data Models

### 1. `User`, `Account`, `Session`, `VerificationToken`
These models are managed by **NextAuth.js** via the Prisma adapter. They handle customer authentication.
- `User` stores email/password (bcrypt-hashed) and links to all their orders.
- `Account` and `Session` support NextAuth's OAuth and session management.
- Deleting a `User` cascades to their `Account` and `Session` records.

### 2. `Order` & `OrderItem`
- **Price snapshots**: `OrderItem.priceCents` and `name` are copied from the menu at the time of ordering. This means historical orders remain accurate even if menu prices change later.
- **Server-side verification**: The API fetches live prices from the DB before creating the order — client-submitted prices are ignored entirely.
- **Tracking**: Each order has a `chatToken` (UUID) that links to the public tracking page `/track/[token]`.
- **Stripe link**: `stripeSessionId` stores the Stripe PaymentIntent ID for reconciliation.
- **Status flow**: `PENDING` → `PAID` (via webhook) → `PREPARING` → `READY` → `COMPLETED` (admin updates).

### 3. `OrderMessage`
- Real-time chat between the customer (via tracking token) and admin (via admin dashboard).
- Cascades on order deletion.
- Indexed on `[orderId, createdAt]` for efficient message retrieval.

### 4. `CateringRequest` & `CateringMessage`
- **Relationship**: One-to-Many. Deleting a `CateringRequest` cascades to all its messages.
- **Token Access**: The `chatToken` allows customers to access their discussion thread at `/catering/chat/[token]` without needing an account.
- **Selections**: Stored as JSON for flexible item configuration without schema migrations.

### 5. `MenuItem`
- Prices stored as `Int` (cents) to avoid floating-point precision issues.
- Indexed on `[category, isAvailable, sortOrder]` for fast public menu rendering.
- `inPos` controls whether the item appears in the point-of-sale ordering flow.

### 6. `CateringItem`
- Uses `priceKind` (`PER_PERSON`, `TRAY`, `FIXED`) to handle different pricing structures in one table.
- `halfPrice` and `fullPrice` apply to the `TRAY` kind.
- `minPeople` enforces minimum guest counts for packages.

### 7. `SiteSettings`
- **Global singleton**: Always accessed with `id: "global"`.
- Exposed to the frontend via `SiteProvider` context (with sensitive fields like `adminAccessPin` stripped out by the public API route).
- `weeklySchedule` stored as JSON for flexible schedule configuration.

### 8. `AdminLoginAttempt`
- Powers the database-backed rate limiting on the admin login and PIN verification endpoints.
- Uses a `pin_` prefix on the `ip` field to separate PIN attempts from password attempts.
- Expired records are cleaned up asynchronously on each login request.
- Indexed on `[ip, expiresAt]` for fast lookups.

### 9. `Review`
- **Flexible ownership**: Can be submitted by logged-in users (`userId`), linked to orders (`orderId`), or tied to menu items (`menuItemId`).
- **Approval workflow**: All reviews start with `isApproved: false`. Admin must approve before they appear on the homepage.
- **Display logic**: The `name` field is always shown (can be "Anonymous" if user prefers), while `text` and `rating` are only visible if `isApproved: true`.
- **Indexed** on `[orderId, menuItemId, userId]` for fast queries.

### 10. `PasswordResetToken`
- Enables the "forgot password" flow via email links.
- **Token security**: Each token is unique and has a short expiration (typically 1 hour).
- **Cleanup**: Expired tokens should be cleaned up periodically via admin scripts or during login attempts.
- **Dual index**: `[email, token]` ensures fast lookup when user clicks reset link and prevents duplicate active tokens per email.
