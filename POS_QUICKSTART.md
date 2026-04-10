# POS Integration - Quick Start

Your website **already has the plumbing for live POS integration**! Here's how to use it:

## ✅ What's Already Built

```
✓ POS Manager - Handles all sync logic
✓ Mock POS Adapter - For testing & development
✓ Webhook Handler - Receives live updates from POS
✓ API Endpoints - Manual sync, status checks
✓ Tests - Comprehensive test coverage
✓ Guides - Full documentation
```

## 🚀 Using Today (Mock POS)

The system is **ready to use right now** with the mock POS:

```bash
# Environment is already set up for mock POS
POS_ENABLED=true
POS_PROVIDER=mock          # Using mock adapter
POS_AUTO_SYNC=true         # Auto-syncs every 30s
```

### Test It Out

```bash
# Run POS tests
npm run test:integration -- pos-integration.test.ts

# All tests should pass ✓
```

## 🔌 Connecting a Real POS

When you have your POS system (Square, Toast, TouchBistro, etc.):

### 1. Create Adapter (15 minutes)

```typescript
// src/lib/pos/adapters/square.adapter.ts
import { IPOSAdapter } from '../types';

export class SquarePOSAdapter implements IPOSAdapter {
    async connect() { /* implement */ }
    async syncItem(item) { /* implement */ }
    async handleWebhook(payload) { /* implement */ }
    // ... other methods
}
```

### 2. Register It (2 minutes)

```typescript
// src/lib/pos/manager.ts
if (config.provider === 'square') {
    this.adapter = new SquarePOSAdapter(config.apiKey!);
}
```

### 3. Configure (2 minutes)

```env
POS_ENABLED=true
POS_PROVIDER=square
POS_API_KEY=your_actual_key
POS_WEBHOOK_SECRET=your_secret
```

### 4. Deploy (3 minutes)

```bash
git push heroku main  # or your deployment command
```

**Done! Your website is now connected to your POS system.**

## 📊 Features Included

### Auto Sync (Website → POS)
```
Menu Item Updated → Auto-synced to POS every 30 seconds
```

### Manual Sync
```bash
# Trigger immediately from admin
curl -X POST /api/admin/pos/sync
```

### Live Webhooks (POS → Website)
```
Inventory Updated in POS
  ↓
Website receives webhook
  ↓
Availability updated immediately
```

### Order Sync
```
Customer Order → Website Database → POS Kitchen Display
```

## 🧪 Testing

All major POS scenarios are tested:

```bash
npm run test:integration -- pos-integration.test.ts

# Includes:
# ✓ Connection management
# ✓ Menu item sync
# ✓ Inventory updates
# ✓ Order handling
# ✓ Webhook processing
# ✓ Error recovery
```

## 🎯 Timeline

| Phase | Time | Action |
|-------|------|--------|
| **Now** | 0 min | Using mock POS for development |
| **When Ready** | 30 min | Implement real POS adapter |
| **Test Phase** | 1-2 days | Test with POS sandbox |
| **Live** | Deploy | Orders flow to kitchen in real-time |

## 📖 Full Docs

For detailed information:
- **[POS_INTEGRATION_GUIDE.md](./POS_INTEGRATION_GUIDE.md)** - Complete setup guide
- **Adapter Examples** - In `/src/lib/pos/adapters/`
- **Tests** - In `/tests/integration/pos-integration.test.ts`

## 🆘 Quick Help

### Check Status
```typescript
import { getPOSManager } from '@/lib/pos/manager';

const manager = getPOSManager();
const status = manager.getStatus();
console.log(status);
// {
//   connected: true,
//   lastConnected: Date,
//   lastSyncAt: Date,
//   nextSyncAt: Date
// }
```

### Trigger Manual Sync
```bash
curl -X POST http://localhost:3000/api/admin/pos/sync
```

### View Logs
Look for `[POS]` prefix in server logs:
```
[POS] Starting menu sync...
[POS] Synced item: Butter Chicken
[POS] ✓ Menu sync complete: 15 items
```

## 🎉 You're Ready!

Your website is **fully prepared for POS integration**. The architecture is in place, tests are written, and you have a clear path to connect any major POS system when you're ready.

**Next step:** Choose your POS provider and create the adapter when you're ready!

---

**Questions?** See [POS_INTEGRATION_GUIDE.md](./POS_INTEGRATION_GUIDE.md) for comprehensive documentation.
