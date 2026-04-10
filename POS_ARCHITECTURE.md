# POS Integration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR WEBSITE                              │
│  (Next.js + React + PostgreSQL)                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    POS Manager                               │
│  - Handles all sync logic                                   │
│  - Manages auto-sync (every 30 seconds)                     │
│  - Webhook routing                                          │
│  - Error handling & recovery                                │
└───┬──────────────────────────────┬──────────────────────────┘
    │                              │
    ▼                              ▼
┌──────────────────┐   ┌──────────────────────┐
│  POS Adapters    │   │  API Endpoints       │
├──────────────────┤   ├──────────────────────┤
│ ✓ Mock           │   │ • POST /api/webhooks │
│ ⏳ Square        │   │   /pos                │
│ ⏳ Toast         │   │ • POST /api/admin/   │
│ ⏳ TouchBistro   │   │   pos/sync           │
│ ⏳ Custom        │   │ • GET  /api/admin/   │
└────────┬─────────┘   │   pos/sync           │
         │             └──────────────────────┘
         │
         ▼
    ┌─────────────────┐
    │  POS System     │
    │                 │
    │ Square ◄────┐   │
    │ Toast  ◄────┼─────────►  Kitchen Display
    │ Custom ◄────┘   │         (Real-time)
    └─────────────────┘
```

## Data Flow Diagrams

### 1. Menu Sync (Website → POS)

```
┌─────────────────────┐
│  Admin adds item    │
│  on website         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│ Item saved to database          │
│ inPos: true                     │
│ isAvailable: true               │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ POSManager.syncMenuItems()      │
│ (Auto every 30s or manual)      │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ Convert to POS format           │
│ - id, name, price, category     │
│ - sku, description              │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ POS Adapter (Square/Toast/etc)  │
│ Makes API call to POS           │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ POS System Updated              │
│ Item appears in kitchen display │
│ Available for ordering          │
└─────────────────────────────────┘
```

### 2. Inventory Sync (POS → Website)

```
┌─────────────────────┐
│  Customer buys      │
│  item at register   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│ POS updates inventory           │
│ Item quantity: 10 → 9           │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ POS sends webhook to website    │
│ POST /api/webhooks/pos          │
│ event: "inventory.updated"      │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ Website receives webhook        │
│ Verifies signature              │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ POSManager.handleWebhook()      │
│ Routes to appropriate handler   │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ handleInventoryUpdate()         │
│ Updates database:               │
│ quantity = 9                    │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ Website immediately shows       │
│ updated availability            │
│ (9 items left)                  │
└─────────────────────────────────┘
```

### 3. Order Flow (Website → POS → Kitchen)

```
┌────────────────────┐
│ Customer places    │
│ order on website   │
└─────────┬──────────┘
          │
          ▼
┌──────────────────────────────────┐
│ Order created in database        │
│ - Items, total, status: PENDING  │
│ - Customer info saved            │
└─────────┬────────────────────────┘
          │
          ▼
┌──────────────────────────────────┐
│ Payment processed via Stripe     │
│ Status: PAID                     │
└─────────┬────────────────────────┘
          │
          ▼
┌──────────────────────────────────┐
│ POSManager.syncOrder()           │
│ Converts to POS format           │
│ Sends to POS system              │
└─────────┬────────────────────────┘
          │
          ▼
┌──────────────────────────────────┐
│ POS System                       │
│ - Creates order in KDS           │
│ - Alerts kitchen staff           │
│ - Status: PREPARING              │
└─────────┬────────────────────────┘
          │
          ▼
┌──────────────────────────────────┐
│ Kitchen prepares food            │
│ (Real-time in kitchen display)   │
│ Status: READY when done          │
└─────────┬────────────────────────┘
          │
          ▼
┌──────────────────────────────────┐
│ POS sends status update webhook  │
│ event: "order.ready"             │
│ Website receives update          │
└─────────┬────────────────────────┘
          │
          ▼
┌──────────────────────────────────┐
│ Customer sees "Order Ready!"     │
│ on tracking page                 │
│ Comes to pickup                  │
└──────────────────────────────────┘
```

### 4. Webhook Event Processing

```
┌─────────────────────────────────────┐
│ Webhook received from POS           │
│ POST /api/webhooks/pos              │
│                                     │
│ {                                   │
│   "event": "inventory.updated",     │
│   "data": { ... }                   │
│ }                                   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ POSManager.handleWebhook(payload)   │
│ - Verify signature                  │
│ - Route to handler                  │
└────────────┬────────────────────────┘
             │
    ┌────────┴───────────────────────────┐
    │                                    │
    ▼                                    ▼
┌──────────────────┐         ┌─────────────────────┐
│ inventory.updated│         │ item.out_of_stock   │
│                  │         │                     │
│ handleInventory  │         │ handleOutOfStock()  │
│ Update()         │         │                     │
│                  │         │ Set isAvailable =   │
│ Update qty in DB │         │ false               │
└──────────────────┘         └─────────────────────┘
    ▼                              ▼
┌──────────────────┐         ┌─────────────────────┐
│ Other events     │         │ More events...      │
│ handled...       │         │                     │
└──────────────────┘         └─────────────────────┘
```

## Component Architecture

```
src/lib/pos/
├── types.ts                      # Type definitions
│   ├── POSItem
│   ├── POSOrder
│   ├── POSWebhookPayload
│   └── IPOSAdapter (interface)
│
├── manager.ts                    # Core POS Manager
│   ├── connect/disconnect
│   ├── syncMenuItems()
│   ├── syncOrder()
│   ├── handleWebhook()
│   ├── Auto-sync loop
│   └── Error handling
│
├── adapters/
│   ├── mock.adapter.ts          # For development ✓
│   ├── square.adapter.ts        # To implement
│   ├── toast.adapter.ts         # To implement
│   └── custom.adapter.ts        # Custom POS
│
src/app/api/
├── webhooks/pos/route.ts        # Webhook handler
│   └── POST /api/webhooks/pos
│
└── admin/pos/
    └── sync/route.ts            # Admin sync control
        ├── POST /api/admin/pos/sync
        └── GET  /api/admin/pos/sync
```

## State Transitions

### Order States
```
PENDING ──► PAID ──► PREPARING ──► READY ──► COMPLETED
   ▲                                           │
   └───────────────────── CANCELLED ◄─────────┘

Legend:
- PENDING: Order created, awaiting payment
- PAID: Payment received, sent to kitchen
- PREPARING: Kitchen is preparing
- READY: Ready for pickup
- COMPLETED: Customer picked up
- CANCELLED: Order cancelled
```

### Item Availability
```
┌─────────────────────────────────────┐
│ Item Available                      │
│ (isAvailable: true)                 │
│ (quantity > 0)                      │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
        ▼                    ▼
    Sold Out          Closed Early
    (qty=0)           (Disabled)
        │                    │
        └─────────┬──────────┘
                  │
                  ▼
    ┌─────────────────────────────────────┐
    │ Item Unavailable                    │
    │ (isAvailable: false)                │
    │ (Shown as "Out of Stock")           │
    └─────────────────────────────────────┘
```

## Error Recovery Flow

```
┌──────────────────┐
│ POS Sync Fails   │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ Check error type:            │
│ - Connection error?          │
│ - Invalid data?              │
│ - Rate limit?                │
└────────┬─────────────────────┘
         │
    ┌────┼────┬────────┐
    │    │    │        │
    ▼    ▼    ▼        ▼
  Retry  Log  Retry  Manual
  w/exp  err  later  trigger

Eventually:
Success ──► Continue normally
Failure ──► Alert admin via dashboard
```

## Adapter Pattern Benefits

```
┌─────────────────────────────────┐
│ Your Application Code           │
│ (Doesn't change)                │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ POS Manager (Abstract)          │
│ Calls IPOSAdapter interface     │
└────────────┬────────────────────┘
             │
    ┌────────┼────────┬────────┐
    │        │        │        │
    ▼        ▼        ▼        ▼
┌────────┐┌──────┐┌──────┐┌────────┐
│ Square ││Toast ││Custom││ Toast  │
│Adapter ││Adapter││Adapter││ v2.0 │
└────────┘└──────┘└──────┘└────────┘

Benefit: Change POS without touching app code!
```

## Environment Configuration Flow

```
.env file
  │
  ├─ POS_ENABLED (true/false)
  ├─ POS_PROVIDER (square/toast/mock)
  ├─ POS_API_KEY (your credentials)
  ├─ POS_API_URL (POS endpoint)
  ├─ POS_WEBHOOK_SECRET (verification)
  ├─ POS_WEBHOOK_URL (callback address)
  ├─ POS_SYNC_INTERVAL (frequency)
  └─ POS_AUTO_SYNC (yes/no)
     │
     ▼
getPOSManager()
     │
     ▼
Initializes correct adapter
based on POS_PROVIDER
     │
     ▼
POS System Connected
```

## Deployment Pipeline

```
Local Development
  │
  ├─ POS_PROVIDER=mock (testing)
  │
  ▼
Staging
  │
  ├─ POS_PROVIDER=square
  ├─ Connect to POS sandbox
  ├─ Test all integration
  │
  ▼
Production
  │
  ├─ POS_PROVIDER=square
  ├─ Connect to POS production
  ├─ Live orders flowing!
  │
  └─ Monitor logs, webhooks
```

---

**This architecture allows you to:**
- ✅ Test with mock POS today
- ✅ Add real POS adapter when ready (15 min implementation)
- ✅ Switch POS systems with minimal code changes
- ✅ Scale as your business grows
- ✅ Handle real-time inventory and orders

**Ready to connect? See [POS_INTEGRATION_GUIDE.md](./POS_INTEGRATION_GUIDE.md)**
