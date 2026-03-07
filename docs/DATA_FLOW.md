# Data Flow

This document outlines how data is fetched, managed, and synchronized across the system, from the database to the front-end components.

---

## 1. Global State Management (`SiteProvider`)
The application avoids complex state libraries (Redux/Zustand) in favor of a clean React Context pattern for global configuration.

### The Flow:
1. **Server-Side Fetch**: The root layout (in `src/app/layout.tsx`) performs a Prisma query to get `SiteSettings`.
2. **Bootstrapping**: The layout wraps the children in `<SiteProvider settings={data}>`.
3. **Consumption**: Any client component (Navbar, Footer, Location) calls the `useSite()` hook to access branding, contact info, and truck status.
4. **Fallback**: If the database query fails or returns null, the context falls back to `src/config/site.ts`.

---

## 2. Catering Request Lifecycle
When a customer submits an inquiry, the data follows this path:

1. **Selection**: User picks items in `CateringPage`. State is managed locally in the component.
2. **POST Request**: The selection is sent to `/api/catering`.
3. **Processing**: 
   - **Validation**: Zod schema check.
   - **Availability**: API checks if `cateringEnabled` is true in DB.
   - **Anti-Spam**: Honeypot trap and Rate Limiting check.
4. **Persistence**: Record created in `CateringRequest` table with a unique `chatToken`.
5. **Messaging**: An automated email (via Resend) is sent to the customer with a direct link to `/catering/chat/[token]`.

---

## 3. Administrative Updates & Sync
When an admin modifies a menu item or site setting, the "stale-while-revalidate" pattern is used.

### Revalidation Strategy:
- **Server Routes**: Admin API handlers (e.g., `DELETE /api/admin/menu-items/[id]`) call `revalidatePath('/menu')` and `revalidatePath('/admin/menu-items')`.
- **Effect**: This clears the Next.js cache for those specific routes, ensuring that both the customer-facing menu and the admin dashboard show updated data immediately on the next visit.

---

## 4. Chat Synchronization
- **Retrieval**: `GET /api/chat/[token]/messages` pulls the full history for a thread.
- **Role Detection**: The system identifies the sender as "ADMIN" or "CUSTOMER" based on the request headers (Auth Cookie vs. Chat Token).
- **Update**: New messages are posted to the thread, appending to the `CateringMessage` table.
