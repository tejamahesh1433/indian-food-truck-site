# Push Notifications Implementation Plan

**Status:** Planned (Not yet implemented)
**Estimated Timeline:** 4-5 weeks
**Complexity:** Medium
**Cost:** Free (no external push service required)

---

## Overview

This document outlines the complete implementation plan for adding Web Push Notifications to the Indian Food Truck app. Push notifications will enable real-time order status updates to customers and new order alerts to admins, significantly improving user engagement and operational efficiency.

---

## Quick Summary

**What:** Browser-based push notifications using the Web Push API
**Who:** Customers (order status updates) + Admins (new order alerts)
**How:** Service Worker + VAPID keys + browser Notification API
**Cost:** Free (no external service required initially)
**Browser Support:** Chrome, Firefox, Edge, Safari 16+

---

## Architecture Overview

### High-Level Flow

```
Customer Order → Webhook (Stripe) → Order Created
                                     ↓
                        Lookup Admin Subscriptions
                                     ↓
                        Send Push to Admin Devices
                                     ↓
                        Service Worker Receives
                                     ↓
                        Display Browser Notification
                                     ↓
                        Admin clicks → Navigate to Orders Page
```

### Key Components

1. **Service Worker** (`public/sw.js`) — Listens for push events and displays notifications
2. **Frontend Utilities** (`lib/push-notifications.ts`) — Request permission, subscribe, manage preferences
3. **Backend Utilities** (`lib/push-notifications-server.ts`) — Send notifications via Web Push Protocol
4. **Database Storage** — Store user subscriptions with endpoint and keys
5. **API Endpoints** — Subscribe, unsubscribe, trigger notifications
6. **UI Components** — Permission prompt, preferences management, notification status

---

## Database Schema

Three new tables required:

### PushSubscription (Customer Device Subscriptions)

```prisma
model PushSubscription {
  id                String    @id @default(cuid())
  userId            String?   @unique
  endpoint          String    @unique
  auth              String
  p256dh            String
  userAgent         String?
  isActive          Boolean   @default(true)
  notificationTypes Json     @default("{\"orderStatus\":true}")
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  user              User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### AdminPushSubscription (Admin Device Subscriptions)

```prisma
model AdminPushSubscription {
  id        String   @id @default(cuid())
  endpoint  String   @unique
  auth      String
  p256dh    String
  userAgent String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}
```

### NotificationLog (Audit Trail)

```prisma
model NotificationLog {
  id            String    @id @default(cuid())
  orderId       String
  type          String    // "ORDER_STATUS", "NEW_ORDER"
  status        String    // "PENDING", "SENT", "FAILED"
  recipientType String    // "CUSTOMER", "ADMIN"
  recipientId   String?
  title         String
  body          String
  data          Json?
  error         String?
  sentAt        DateTime?
  createdAt     DateTime  @default(now())
}
```

---

## Implementation Phases

### Phase 1: Core Setup (Week 1)
- Generate VAPID keys
- Create push utilities (client + server)
- Update service worker with push event handler
- Create subscription API endpoints

**Files:**
- `src/lib/push-notifications.ts`
- `src/lib/push-notifications-server.ts`
- `public/sw.js` (update)
- `src/app/api/notifications/subscribe/route.ts`
- `src/app/api/notifications/unsubscribe/route.ts`

### Phase 2: Order Notifications (Weeks 1.5-2.5)
- Create endpoints to trigger notifications
- Wire into Stripe webhook for new order alerts
- Wire into admin order status updates
- Handle error recovery and logging

**Files:**
- `src/app/api/notifications/trigger-order-status/route.ts`
- `src/app/api/notifications/trigger-new-order/route.ts`
- `src/app/api/webhooks/stripe/route.ts` (update)

### Phase 3: User Preferences (Weeks 2-2.5)
- Create notification preferences page
- Add toggle for notification types
- Device management UI

**Files:**
- `src/app/profile/notifications/page.tsx`
- `src/components/NotificationPreferences.tsx`

### Phase 4: Admin Integration (Weeks 2.5-3)
- Add notification status to admin dashboard
- View notification history/logs
- Test notification button

**Files:**
- `src/app/admin/notifications/page.tsx`
- `src/app/admin/notifications/logs/page.tsx`

### Phase 5: Error Handling (Weeks 3-3.5)
- Implement retry logic
- Fallback to email/in-app toast
- Error logging and alerts

**Files:**
- `src/lib/push-error-handling.ts`

### Phase 6: Testing (Week 4)
- Unit tests
- Integration tests
- E2E tests
- Cross-browser testing

### Phase 7: Deployment & Monitoring (Week 4-5)
- Staging deployment
- Monitor delivery rates
- Beta rollout
- General availability

---

## Key Features by Phase

**Phase 1 & 2:** Customer receives "Order READY" notification, admin gets "New order from John" alert
**Phase 3:** Customers can disable notifications if they prefer
**Phase 4:** Admin can see notification history and retry failed ones
**Phase 5:** If push fails, fallback to email or in-app toast
**Phase 6:** Comprehensive testing across all browsers and devices

---

## Browser Support

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome  | ✅ Full | ✅ Full | Perfect support |
| Firefox | ✅ Full | ✅ Full | Perfect support |
| Edge    | ✅ Full | ✅ Full | Chromium-based |
| Safari  | ⚠️ 16+  | ⚠️ 16.4+ | Limited; shows notifications only in foreground on iOS |
| Opera   | ✅ Full | N/A | Desktop only |

**Recommendation:** Show informational message to iOS users about Safari's notification limitations.

---

## Security Considerations

1. **VAPID Keys:** One-time setup, store in `.env`
   ```
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
   VAPID_PRIVATE_KEY=...
   VAPID_SUBJECT=mailto:admin@example.com
   ```

2. **Authentication:** NextAuth session validation on subscribe/unsubscribe endpoints

3. **Rate Limiting:** Max 1 subscribe per user per 5 seconds, max 10 subscriptions per user

4. **Data Privacy:** Never log subscription endpoint URLs in error messages

5. **Injection Prevention:** Validate notification title/body length and structure with Zod

---

## Dependencies

Only **1 new npm package:**

```bash
npm install web-push @types/web-push
```

Size: ~50KB minified
No external service required (saves cost!)

---

## Cost Analysis

| Component | Cost |
|-----------|------|
| Web-push library | Free (open source) |
| Push notifications | Free (browser native) |
| Database storage | Minimal (~1KB per user) |
| API calls | Free (local only) |
| **TOTAL** | **Free** |

**vs. Firebase Cloud Messaging:** FCM charges $1-5 per 1M notifications

---

## Testing Strategy

### Unit Tests (40 tests)
- Permission request flow
- Subscription validation
- Error recovery
- Preference persistence

### Integration Tests (30 tests)
- Database CRUD operations
- API endpoints
- Webhook integration
- Subscription lifecycle

### E2E Tests (15 tests)
- User subscribes → receives notification
- Click notification → navigate to page
- Admin unsubscribes → stops receiving
- Multi-device subscription management

### Manual Testing
- Chrome, Firefox, Safari, Edge
- Desktop + Mobile
- Offline scenarios
- Expired subscriptions

---

## Success Metrics (Post-Launch)

- **Adoption:** 40-50% of customers enable notifications
- **Delivery:** 95%+ success rate
- **Engagement:** 30%+ click-through rate
- **Operational:** 50% faster admin response time

---

## Optional Enhancements (Phase 8+)

1. **Scheduled Notifications** — "Your order ready at 5:30 PM"
2. **Quiet Hours** — No notifications 10 PM - 8 AM
3. **Advanced Targeting** — Promotions to opted-in users
4. **Firebase Migration** — For iOS native app support
5. **Localization** — Multi-language notifications

---

## Implementation Checklist

- [ ] Generate VAPID key pair
- [ ] Add to `.env.local`
- [ ] Create `src/lib/push-notifications.ts`
- [ ] Create `src/lib/push-notifications-server.ts`
- [ ] Update `public/sw.js` with push handler
- [ ] Create subscription endpoints
- [ ] Create trigger endpoints
- [ ] Wire into Stripe webhook
- [ ] Create preferences UI
- [ ] Create admin dashboard
- [ ] Write tests
- [ ] Deploy to staging
- [ ] Monitor and collect feedback
- [ ] General availability rollout

---

## Next Steps

1. **Review this plan** with team
2. **Allocate resources:** 1 senior + 1 junior developer recommended
3. **Set timeline:** 4-5 weeks for full implementation
4. **Prepare MVP:** Start with Phase 1-2 (2 weeks) for customer order status notifications
5. **Plan deployment:** Staging → beta → GA with monitoring

---

## References

- [Web Push Protocol (RFC 8030)](https://tools.ietf.org/html/rfc8030)
- [Web Push API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Notification API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notification)
- [web-push npm package](https://www.npmjs.com/package/web-push)
- [Service Worker Guide](https://developers.google.com/web/fundamentals/primers/service-workers)

---

**Questions?** Contact the development team or see `docs/` for related documentation.

