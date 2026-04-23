# API Documentation

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://yourdomain.com/api`

## Authentication
Most endpoints require authentication via NextAuth session. Some endpoints support JWT tokens for anonymous access.

### Session Authentication
User must be logged in. Session is managed via HTTP-only cookies.

### JWT Anonymous Token
For order tracking without login: Use JWT token provided after order creation.

### Admin Authentication
Protected by NextAuth session + PIN verification for sensitive operations.

---

## Orders Endpoints

### Create Order
**POST** `/orders`
- **Authentication**: NextAuth session (optional, supports anonymous)
- **Body**:
```json
{
  "items": [
    {
      "menuItemId": "item-123",
      "quantity": 2,
      "specialInstructions": "No onions"
    }
  ],
  "paymentMethodId": "pm_stripe123",
  "deliveryAddress": "123 Main St",
  "notes": "Leave at door"
}
```
- **Response**:
```json
{
  "id": "order-123",
  "status": "PENDING",
  "totalAmount": 2599,
  "trackingToken": "jwt-token-for-anonymous-tracking",
  "createdAt": "2026-04-23T10:00:00Z"
}
```

### Get Order Details
**GET** `/orders/[id]`
- **Authentication**: NextAuth session OR JWT token in query `?token=jwt`
- **Query Params**:
  - `token` (optional): JWT token for anonymous access
- **Response**:
```json
{
  "id": "order-123",
  "status": "PREPARING",
  "items": [...],
  "totalAmount": 2599,
  "estimatedReady": "2026-04-23T10:30:00Z",
  "customerMessages": [...],
  "statusHistory": [...]
}
```

### List User Orders
**GET** `/user/orders`
- **Authentication**: NextAuth session (required)
- **Query Params**:
  - `status`: Filter by status (PENDING, PAID, PREPARING, READY, COMPLETED, CANCELLED)
  - `limit`: Results per page (default: 10)
  - `offset`: Pagination offset
- **Response**: Array of order objects

### Cancel Order (Customer Self-Service)
**POST** `/orders/[id]/cancel-self`
- **Authentication**: JWT token via `chatToken` query parameter
- **Query Params**:
  - `chatToken`: JWT token provided in order response
- **Body**: Empty
- **Response**:
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```
- **Status Codes**:
  - `200`: Cancellation successful
  - `400`: Order already in final state (COMPLETED, READY)
  - `401`: Invalid token
  - `404`: Order not found

### Track Order (Real-time WebSocket)
**WebSocket** `/api/orders/[id]/track`
- **Query Params**:
  - `token`: JWT token for anonymous tracking
- **Message Types**:
```json
{
  "type": "ORDER_STATUS_UPDATED",
  "status": "PREPARING",
  "message": "Kitchen is preparing your order",
  "estimatedTime": 15
}
```

---

## Admin Orders Endpoints

### Get Filtered Orders (Kitchen Display)
**GET** `/admin/orders/filtered`
- **Authentication**: NextAuth session (admin required)
- **Query Params**:
  - `status`: Filter by status (PENDING, PAID, PREPARING, READY, COMPLETED)
  - `search`: Search by order ID or customer name
  - `startDate`: ISO date string for range start
  - `endDate`: ISO date string for range end
  - `limit`: Results per page (default: 20)
  - `offset`: Pagination offset
- **Response**:
```json
{
  "orders": [
    {
      "id": "order-123",
      "customerId": "user-123",
      "customerName": "John Doe",
      "status": "PENDING",
      "items": [...],
      "totalAmount": 2599,
      "createdAt": "2026-04-23T10:00:00Z",
      "specialInstructions": "No onions"
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20
}
```

### Update Order Status
**PATCH** `/admin/orders/[id]`
- **Authentication**: NextAuth session (admin required)
- **Body**:
```json
{
  "status": "PREPARING",
  "notes": "Order in progress"
}
```
- **Response**: Updated order object

### Update Order Status (Quick Toggle)
**PATCH** `/admin/orders/[id]/status`
- **Authentication**: NextAuth session (admin required)
- **Body**:
```json
{
  "status": "READY"
}
```
- **Response**:
```json
{
  "success": true,
  "status": "READY"
}
```

---

## Menu Endpoints

### Get All Menu Items
**GET** `/menu`
- **Authentication**: None (public)
- **Query Params**:
  - `includeDisabled`: Include disabled items (default: false)
- **Response**:
```json
{
  "items": [
    {
      "id": "item-123",
      "name": "Butter Chicken",
      "description": "Creamy tomato-based curry",
      "price": 1299,
      "image": "https://...",
      "available": true,
      "category": "Curries"
    }
  ]
}
```

### Get Menu Item
**GET** `/menu/[id]`
- **Authentication**: None (public)
- **Response**: Single menu item object

### Create Menu Item
**POST** `/admin/menu-items`
- **Authentication**: NextAuth session (admin required)
- **Body**:
```json
{
  "name": "Butter Chicken",
  "description": "Creamy tomato curry",
  "price": 1299,
  "image": "https://...",
  "category": "Curries",
  "available": true
}
```
- **Response**: Created menu item object

### Update Menu Item
**PATCH** `/admin/menu-items/[id]`
- **Authentication**: NextAuth session (admin required)
- **Body**: Partial menu item fields
- **Response**: Updated menu item object

### Toggle Item Availability (Quick)
**PATCH** `/admin/menu-items/toggle-availability/[id]`
- **Authentication**: NextAuth session (admin required)
- **Body**: Empty
- **Response**:
```json
{
  "success": true,
  "available": false,
  "message": "Item marked as unavailable"
}
```

---

## User Profile Endpoints

### Get User Profile
**GET** `/user/profile`
- **Authentication**: NextAuth session (required)
- **Response**:
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://...",
  "emailVerified": true,
  "createdAt": "2026-01-15T00:00:00Z",
  "totalOrders": 12,
  "totalSpent": 45000,
  "favorites": [...],
  "savedLocations": [...]
}
```

### Update User Profile
**PATCH** `/user/profile`
- **Authentication**: NextAuth session (required)
- **Body**:
```json
{
  "name": "Jane Doe",
  "avatar": "image-base64"
}
```
- **Response**: Updated user object

### Delete User Account
**DELETE** `/user/profile`
- **Authentication**: NextAuth session (required)
- **Body**: 
```json
{
  "password": "user-password"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Account deleted"
}
```

### Get User Invoices
**GET** `/user/invoices`
- **Authentication**: NextAuth session (required)
- **Query Params**:
  - `limit`: Results per page (default: 20)
- **Response**:
```json
{
  "invoices": [
    {
      "orderId": "order-123",
      "date": "2026-04-23",
      "total": 2599,
      "status": "COMPLETED",
      "items": [...]
    }
  ]
}
```

### Download Invoice PDF
**GET** `/user/invoices/[orderId]/pdf`
- **Authentication**: NextAuth session (required)
- **Response**: PDF file download

---

## Authentication Endpoints

### Email Verification
**POST** `/auth/verify-email`
- **Authentication**: None
- **Body**:
```json
{
  "email": "user@example.com"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

### Verify Email Token
**GET** `/auth/verify-email?token=jwt-token`
- **Authentication**: None
- **Query Params**:
  - `token`: Verification token from email
- **Response**:
```json
{
  "success": true,
  "message": "Email verified"
}
```

### Resend Verification
**POST** `/auth/resend-verification`
- **Authentication**: NextAuth session
- **Response**: Confirmation message

---

## Admin Settings Endpoints

### Get Settings
**GET** `/admin/settings`
- **Authentication**: NextAuth session (admin required)
- **Response**:
```json
{
  "businessName": "Indian Food Truck",
  "phone": "+1234567890",
  "instagramUrl": "https://instagram.com/...",
  "cityState": "San Francisco, CA",
  "logoUrl": "https://...",
  "truckToday": "Downtown Market",
  "truckNext": "Weekend Fair",
  "bannerEnabled": true,
  "bannerText": "Special: 20% off biryani",
  "weeklySchedule": { ... },
  "emailSettings": {
    "emailOrderStatusUpdates": true,
    "emailNewsletterSend": true,
    "emailVerificationRequired": false,
    "emailAdminAlerts": true
  }
}
```

### Update Settings
**PUT** `/admin/settings`
- **Authentication**: NextAuth session (admin required)
- **Body**: Partial settings object
- **Response**: Updated settings

### Update Email Settings
**PATCH** `/admin/settings/email`
- **Authentication**: NextAuth session (admin required)
- **Body**:
```json
{
  "emailOrderStatusUpdates": true,
  "emailNewsletterSend": false,
  "emailVerificationRequired": true,
  "emailAdminAlerts": true
}
```
- **Response**: Updated email settings

---

## Newsletter Endpoints

### Get Subscribers
**GET** `/admin/newsletter/subscribers`
- **Authentication**: NextAuth session (admin required)
- **Query Params**:
  - `limit`: Results per page (default: 50)
  - `offset`: Pagination offset
- **Response**:
```json
{
  "subscribers": [
    {
      "id": "sub-123",
      "email": "user@example.com",
      "subscribedAt": "2026-04-23T00:00:00Z"
    }
  ],
  "total": 150
}
```

### Send Newsletter
**POST** `/admin/newsletter/send`
- **Authentication**: NextAuth session (admin required)
- **Body**:
```json
{
  "subject": "Weekly Specials",
  "content": "Check out this week's specials...",
  "htmlContent": "<h1>Weekly Specials</h1>..."
}
```
- **Response**:
```json
{
  "success": true,
  "sentCount": 150,
  "message": "Newsletter sent successfully"
}
```

### Subscribe to Newsletter
**POST** `/newsletter/subscribe`
- **Authentication**: None
- **Body**:
```json
{
  "email": "user@example.com"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Subscribed successfully"
}
```

---

## Support Chat Endpoints

### Get Unread Count
**GET** `/admin/support/unread-count`
- **Authentication**: NextAuth session (admin required)
- **Response**:
```json
{
  "totalUnread": 5,
  "conversations": [
    {
      "conversationId": "chat-123",
      "unreadCount": 2,
      "lastMessage": "Can I modify my order?"
    }
  ]
}
```

### Send Support Message
**POST** `/support/messages`
- **Authentication**: NextAuth session OR anonymous
- **Body**:
```json
{
  "conversationId": "chat-123",
  "message": "When will my order be ready?"
}
```
- **Response**:
```json
{
  "success": true,
  "messageId": "msg-123"
}
```

### Get Support Conversation
**GET** `/support/conversations/[id]`
- **Authentication**: NextAuth session OR JWT token
- **Response**:
```json
{
  "id": "chat-123",
  "messages": [
    {
      "id": "msg-123",
      "senderRole": "customer",
      "message": "When will my order be ready?",
      "timestamp": "2026-04-23T10:15:00Z"
    }
  ]
}
```

---

## Catering Endpoints

### Get Catering Requests
**GET** `/admin/catering`
- **Authentication**: NextAuth session (admin required)
- **Query Params**:
  - `status`: Filter by status (PENDING, APPROVED, REJECTED, COMPLETED)
  - `limit`: Results per page (default: 20)
- **Response**: Array of catering request objects

### Get Catering Analytics
**GET** `/admin/catering/analytics`
- **Authentication**: NextAuth session (admin required)
- **Query Params**:
  - `startDate`: ISO date string
  - `endDate`: ISO date string
- **Response**:
```json
{
  "totalRequests": 25,
  "approvedRequests": 20,
  "rejectedRequests": 3,
  "pendingRequests": 2,
  "totalRevenue": 150000,
  "averageOrderValue": 7500,
  "requestsByDate": [...]
}
```

### Create Catering Request
**POST** `/catering/request`
- **Authentication**: None
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "eventDate": "2026-05-15",
  "guestCount": 50,
  "cuisine": "Indian",
  "budget": 500,
  "specialRequests": "Vegetarian-friendly options"
}
```
- **Response**: Created catering request object

### Update Catering Request
**PATCH** `/admin/catering/[id]`
- **Authentication**: NextAuth session (admin required)
- **Body**:
```json
{
  "status": "APPROVED",
  "price": 5000,
  "notes": "Confirmed for May 15"
}
```
- **Response**: Updated catering request

---

## Favorites Endpoints

### Add to Favorites
**POST** `/user/favorites`
- **Authentication**: NextAuth session (required)
- **Body**:
```json
{
  "menuItemId": "item-123"
}
```
- **Response**: Favorite object

### Remove from Favorites
**DELETE** `/user/favorites/[menuItemId]`
- **Authentication**: NextAuth session (required)
- **Response**: Success message

### Get User Favorites
**GET** `/user/favorites`
- **Authentication**: NextAuth session (required)
- **Response**: Array of favorite items with full menu item details

---

## Saved Locations Endpoints

### Add Saved Location
**POST** `/user/saved-locations`
- **Authentication**: NextAuth session (required)
- **Body**:
```json
{
  "label": "Home",
  "address": "123 Main St, San Francisco, CA 94105",
  "lat": 37.7749,
  "lng": -122.4194
}
```
- **Response**: Saved location object

### Get Saved Locations
**GET** `/user/saved-locations`
- **Authentication**: NextAuth session (required)
- **Response**: Array of saved locations

### Delete Saved Location
**DELETE** `/user/saved-locations/[id]`
- **Authentication**: NextAuth session (required)
- **Response**: Success message

### Update Saved Location
**PATCH** `/user/saved-locations/[id]`
- **Authentication**: NextAuth session (required)
- **Body**: Partial location fields
- **Response**: Updated location object

---

## Reviews Endpoints

### Add Review
**POST** `/orders/[orderId]/reviews`
- **Authentication**: NextAuth session (required)
- **Body**:
```json
{
  "menuItemId": "item-123",
  "rating": 5,
  "text": "Delicious and fresh!"
}
```
- **Response**: Created review object

### Get Order Reviews
**GET** `/orders/[orderId]/reviews`
- **Authentication**: None (public)
- **Response**: Array of reviews for the order's items

### Update Review
**PATCH** `/reviews/[id]`
- **Authentication**: NextAuth session (required, owner only)
- **Body**:
```json
{
  "rating": 4,
  "text": "Updated review text"
}
```
- **Response**: Updated review object

### Delete Review
**DELETE** `/reviews/[id]`
- **Authentication**: NextAuth session (required, owner only)
- **Response**: Success message

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error code",
  "message": "Human-readable error message"
}
```

### Common Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad request / validation error
- `401`: Unauthorized / authentication required
- `403`: Forbidden / permission denied
- `404`: Not found
- `409`: Conflict / duplicate
- `500`: Server error

---

## Rate Limiting

- **Public endpoints**: 100 requests per minute per IP
- **Authenticated endpoints**: 1000 requests per minute per user
- **Admin endpoints**: 500 requests per minute per admin

---

## Webhooks

### Stripe Webhook
**POST** `/webhooks/stripe`
- **Events handled**:
  - `payment_intent.succeeded`: Mark order as PAID
  - `payment_intent.payment_failed`: Mark order as FAILED
  - `charge.refunded`: Handle refund processing
