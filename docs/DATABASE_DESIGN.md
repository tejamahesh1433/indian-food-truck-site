# Database Design

## Entity Relationship Diagram

```mermaid
erDiagram
    MenuItem {
        string id PK
        string name
        string description
        float priceCents
        string category
        boolean isVeg
        boolean isSpicy
        boolean isPopular
        boolean isAvailable
        datetime createdAt
    }
    CateringRequest {
        string id PK
        string name
        string email
        string phone
        string eventDate
        string guests
        string location
        string notes
        string status
        string chatToken
        datetime createdAt
    }
    CateringItem {
        string id PK
        string name
        string description
        string category
        string priceKind
        float amount
        float halfPrice
        float fullPrice
    }
    SiteSettings {
        string id PK
        string businessName
        string cityState
        string phone
        string email
        string instagramUrl
        boolean cateringEnabled
    }
    CateringMessage {
        string id PK
        string requestId FK
        string content
        string sender
        datetime createdAt
    }
    CateringRequest ||--o{ CateringMessage : has
```

---

## Main Tables

### MenuItem Table
Stores items for the public food truck menu.

### CateringRequest Table
Stores incoming catering inquiries and their current status.

### CateringItem Table
Stores professional catering menu offerings (packages, trays, etc.).

### SiteSettings Table
Stores global configuration for the truck (branding, contact info, toggles).
