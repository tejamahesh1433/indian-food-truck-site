# POS Integration Guide

Your Indian Food Truck website is **ready to connect with any POS system** for live inventory and order sync!

## 🏗️ Architecture

The POS integration uses an **adapter pattern** - this means you can swap different POS providers without changing your application code.

```
Your Website
    ↓
POSManager (handles sync logic)
    ↓
POS Adapter (provider-specific)
    ↓
Square / Toast / TouchBistro / etc.
```

## 📦 Current Status

- ✅ **Mock POS Adapter** - For testing and development
- ✅ **Webhook Handler** - Receives live updates from POS
- ✅ **Sync Manager** - Bi-directional menu/order sync
- ⏳ **Real Adapters** - Ready to implement

## 🚀 Getting Started

### 1. Environment Configuration

Add these to your `.env` file:

```env
# POS System Configuration
POS_ENABLED=true
POS_PROVIDER=mock                    # Change to 'square', 'toast', etc. later
POS_API_KEY=your_api_key             # Leave empty for mock
POS_API_URL=https://api.pos.com     # Your POS API endpoint
POS_WEBHOOK_SECRET=your_webhook_secret
POS_WEBHOOK_URL=https://yoursite.com/api/webhooks/pos
POS_SYNC_INTERVAL=30000              # Sync every 30 seconds
POS_AUTO_SYNC=true                   # Auto-sync menu items
```

### 2. Initialize on App Startup

Update `src/app/layout.tsx` or your server initialization:

```typescript
import { initializePOS } from '@/lib/pos/manager';

// In your app initialization:
await initializePOS();
```

### 3. Test with Mock POS

Run tests with mock POS:

```bash
npm run test:integration -- pos-integration.test.ts
```

## 🔌 Implementing a Real POS Adapter

When you're ready to integrate with Square, Toast, or another POS system:

### Step 1: Create Adapter File

Create `src/lib/pos/adapters/square.adapter.ts`:

```typescript
import { IPOSAdapter, POSItem, POSOrder } from '../types';
import SquareClient from 'square';

export class SquarePOSAdapter implements IPOSAdapter {
    private client: SquareClient;
    private connected = false;

    constructor(apiKey: string) {
        this.client = new SquareClient({
            accessToken: apiKey,
            environment: 'production',
        });
    }

    async connect(): Promise<boolean> {
        try {
            // Test connection
            await this.client.catalogApi.listCatalog();
            this.connected = true;
            console.log('[Square] ✓ Connected');
            return true;
        } catch (error) {
            console.error('[Square] Connection failed:', error);
            return false;
        }
    }

    async syncItem(item: POSItem): Promise<boolean> {
        // Implement Square-specific sync logic
        // Convert menu item to Square item format
        // Call Square API to create/update
    }

    // ... implement other methods
}
```

### Step 2: Register Adapter in Manager

Update `src/lib/pos/manager.ts`:

```typescript
import { SquarePOSAdapter } from './adapters/square.adapter';

constructor(config: POSConfig) {
    // ...
    if (config.provider === 'square') {
        this.adapter = new SquarePOSAdapter(config.apiKey!);
    }
    // ...
}
```

### Step 3: Update Environment

```env
POS_ENABLED=true
POS_PROVIDER=square
POS_API_KEY=sq_live_your_actual_api_key
```

## 📡 How It Works

### Menu Sync (Website → POS)

1. Admin creates/edits menu item on website
2. Item marked with `inPos: true` flag
3. Auto-sync sends to POS every 30 seconds
4. Or trigger manual sync: `POST /api/admin/pos/sync`

```
Database Menu Item
    ↓
POSManager.syncMenuItems()
    ↓
Square/Toast/etc API
    ↓
POS System Updated
```

### Inventory Sync (POS → Website)

1. POS system sends webhook when inventory changes
2. `POST /api/webhooks/pos` receives the update
3. Website updates availability automatically
4. Customer sees real-time stock status

```
Customer buys item in store
    ↓
POS Updates inventory
    ↓
POS sends webhook
    ↓
Website receives webhook
    ↓
Menu item marked unavailable (if out of stock)
```

### Order Sync (Website → POS → Kitchen)

1. Customer places order on website
2. Order created in database
3. POS sync sends order to kitchen display
4. Admin can accept/reject from their POS
5. Website shows status in real-time

```
Customer Order
    ↓
Website Database
    ↓
POSManager.syncOrder()
    ↓
Kitchen Display System
    ↓
Kitchen prepares
    ↓
Status syncs back to website
```

## 🔗 API Endpoints

### Webhooks

**POST `/api/webhooks/pos`** - Receive events from POS

Events received:
- `item.created` - New item added to POS
- `item.updated` - Item details changed
- `item.out_of_stock` - Item no longer available
- `inventory.updated` - Stock quantity changed
- `price.updated` - Price changed in POS
- `order.created` - New order from POS
- `order.completed` - Order finished in kitchen

Example webhook:

```json
{
    "event": "inventory.updated",
    "timestamp": "2026-04-09T12:34:56Z",
    "data": {
        "itemId": "item-123",
        "quantity": 5,
        "sku": "SKU-ITEM123"
    }
}
```

### Admin Endpoints

**POST `/api/admin/pos/sync`** - Manually sync all items to POS

```bash
curl -X POST https://yoursite.com/api/admin/pos/sync
```

Response:

```json
{
    "success": true,
    "message": "Menu items synced to POS",
    "status": {
        "connected": true,
        "lastConnected": "2026-04-09T12:30:00Z",
        "lastSyncAt": "2026-04-09T12:34:00Z",
        "nextSyncAt": "2026-04-09T12:35:00Z"
    }
}
```

**GET `/api/admin/pos/sync`** - Check sync status

```bash
curl https://yoursite.com/api/admin/pos/sync
```

## 🧪 Testing

All POS integration features are tested with comprehensive test suite:

```bash
# Run POS integration tests
npm run test:integration -- pos-integration.test.ts

# Tests cover:
# - Connection management
# - Item syncing
# - Inventory management
# - Order creation
# - Webhook handling
# - Error scenarios
```

## 🔒 Security

### Webhook Signature Verification

```typescript
// In POS adapter
verifyWebhookSignature(payload: string, signature: string): boolean {
    // Example for Square:
    const hash = crypto
        .createHmac('sha256', process.env.POS_WEBHOOK_SECRET!)
        .update(payload)
        .digest('hex');

    return hash === signature;
}
```

Implement signature verification in each adapter to ensure webhooks are from your POS provider.

## 📊 Monitoring & Debugging

### Check POS Status

```typescript
import { getPOSManager } from '@/lib/pos/manager';

const manager = getPOSManager();
const status = manager.getStatus();

console.log('Connected:', status.connected);
console.log('Last sync:', status.lastSyncAt);
console.log('Next sync:', status.nextSyncAt);
```

### View Sync Logs

Check server logs for `[POS]` prefix:

```
[POS] Starting menu sync...
[POS] Synced item: Butter Chicken
[POS] ✓ Menu sync complete: 15 items synced
[POS] ✓ Order synced: order-123 → POS-1234567890-abc123
```

### Webhook Testing

Test webhook endpoint:

```bash
curl -X POST http://localhost:3000/api/webhooks/pos \
  -H "Content-Type: application/json" \
  -d '{
    "event": "inventory.updated",
    "timestamp": "2026-04-09T12:34:56Z",
    "data": {
      "itemId": "item-123",
      "quantity": 10
    }
  }'
```

## 🛠️ Supported POS Systems

### Ready to Build

- **Square (Square for Restaurants)** - Popular, good API
- **Toast** - Cloud-based, strong integration capabilities
- **TouchBistro** - iPad-based system
- **Lightspeed** - Small business friendly
- **Clover** - Simple integration

### Implementation Checklist

For each POS system, you need to:

- [ ] Create adapter class (extends `IPOSAdapter`)
- [ ] Implement connection logic (API auth)
- [ ] Implement item sync (map to POS format)
- [ ] Implement inventory sync
- [ ] Implement order sync
- [ ] Implement webhook verification
- [ ] Implement webhook handlers
- [ ] Add unit tests
- [ ] Test with real POS system
- [ ] Document POS-specific setup

## 📝 Examples

### Add Item to POS

```typescript
const manager = getPOSManager();

const item = {
    id: 'item-123',
    name: 'Butter Chicken',
    price: 12.99,
    category: 'Mains',
    available: true,
    sku: 'SKU-ITEM123',
};

const synced = await manager.adapter.syncItem(item);
```

### Handle Order

```typescript
const order = await prisma.order.findUnique({
    where: { id: 'order-456' },
    include: { items: true },
});

const posOrderId = await manager.syncOrder(order.id);
// Order is now in kitchen display system
```

### React to Inventory Update

Webhook arrives from POS:

```json
{
    "event": "inventory.updated",
    "data": {
        "itemId": "item-789",
        "quantity": 0
    }
}
```

Automatically:

```typescript
// Database updated
await prisma.menuItem.update({
    where: { id: 'item-789' },
    data: { isAvailable: false }
});

// Website shows item as sold out immediately
```

## 🆘 Troubleshooting

### POS Won't Connect

```typescript
const status = manager.getStatus();
if (!status.connected) {
    console.error('Error:', status.error);
    // Check API key, network, POS system status
}
```

### Items Not Syncing

1. Check `inPos: true` flag on items
2. Check POS_AUTO_SYNC is enabled
3. Check API key permissions
4. Manually trigger: `POST /api/admin/pos/sync`
5. Check server logs for `[POS]` errors

### Webhook Not Received

1. Verify webhook URL is correct
2. Check POS webhook settings
3. Verify webhook IP whitelist (if any)
4. Test with Postman: `POST /api/webhooks/pos`
5. Check firewall/network settings

## 📚 Resources

- [Square API Docs](https://developer.squareup.com/)
- [Toast API Docs](https://dev.toasttab.com/)
- [TouchBistro Integration](https://www.touchbistro.com/integrations)
- [Webhook Best Practices](https://www.datadoghq.com/blog/webhook-best-practices/)

## 🎯 Next Steps

1. **Choose your POS system** - Evaluate options
2. **Get API credentials** - Contact POS provider
3. **Create adapter** - Follow the guide above
4. **Test with sandbox** - POS usually has test environment
5. **Deploy and monitor** - Watch logs for issues
6. **Celebrate** - Orders flowing from online to kitchen! 🎉

---

**Your system is ready. When you're ready to connect a real POS, just create the adapter and update the configuration!**
