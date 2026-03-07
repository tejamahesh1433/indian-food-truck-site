# Database Design

The application uses **PostgreSQL** (hosted on Supabase) with **Prisma ORM** for type-safe data access.

---

## Entity Relationship Diagram

```mermaid
erDiagram
    CateringRequest ||--o{ CateringMessage : has
    MenuItem }|--|| MenuCategory : belongs_to
    CateringItem }|--|| CateringCategory : belongs_to

    CateringRequest {
        string id PK
        string name
        string email
        string phone
        string eventDate
        string guests
        string location
        string status "NEW | CONTACTED | DONE"
        string chatToken "Unique access key"
        json selections "Array of item customisations"
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
        boolean isAvailable
        int sortOrder
    }

    SiteSettings {
        string id PK "Always 'global'"
        string businessName
        string phone
        boolean cateringEnabled
        string todayStatus "OPEN | CLOSED"
    }
```

---

## Detailed Data Models

### 1. `CateringRequest` & `CateringMessage`
- **Relationship**: One-to-Many.
- **Cascading**: Deleting a `CateringRequest` will automatically delete all associated `CateringMessage` records.
- **Token Access**: The `chatToken` allows customers to access their specific discussion thread without a full user account.

### 2. `MenuItem`
- **Price Handling**: Prices are stored as `Int` (priceCents) to avoid floating-point math issues.
- **Optimization**: Indexes are applied to `category`, `isAvailable`, and `sortOrder` for fast menu rendering.

### 3. `CateringItem`
- **Variability**: Uses a `priceKind` field ("PER_PERSON", "TRAY", "FIXED") to handle different pricing structures in the same table.
- **Fields**: `halfPrice` and `fullPrice` are specific to the "TRAY" kind.

### 4. `SiteSettings`
- **Global Singleton**: The application logic strictly uses the record with `id: "global"` to fetch site-wide configuration.
- **Advanced Scheduling**: Includes individual fields for `todayStart`, `todayEnd`, and `todayLocation` to provide precise info to the `Location` component.
