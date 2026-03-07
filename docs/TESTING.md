# Testing Documentation

## Testing Philosophy
The project employs a **3-layer testing strategy** to ensure reliability across logic, database, and browser interactions.

---

## Testing Tools

* **Vitest**: Fast unit and integration testing.
* **React Testing Library**: Component-level verification.
* **Playwright**: End-to-end browser testing.

---

## 1. Unit Testing
Focuses on pure utility functions without external dependencies.
* **Files**: `tests/unit/*.test.ts`
* **Examples**: 
    * `priceLabel`: Ensures currency formatting and tray-size logic is correct.
    * `phone`: Validates E.164 normalization for SMS/Call links.
    * `cateringSummary`: Verifies the auto-generation of request notes.

---

## 2. Integration Testing
Verifies the interaction between code and the database (Prisma).
* **Files**: `tests/integration/*.test.ts`
* **Database**: Uses an isolated local/test database.
* **Examples**:
    * Verifying that a `CateringRequest` is successfully saved to the DB.
    * Ensuring `SiteSettings` updates correctly reflect in the `SiteProvider`.

---

## 3. End-to-End Testing
Simulates real user behavior in a headless browser.
* **Files**: `tests/e2e/*.spec.ts`
* **Examples**:
    * **Catering Flow**: Customer selects items, fills form, and submits.
    * **Admin Login**: Ensuring the password wall blocks unauthorized access.
    * **Responsive Check**: Verifying the "Call" button visibility on mobile vs desktop.

---

## Safety Guard
The project includes a **production safety guard** in `tests/helpers/db.ts` that detects if the test suite is accidentally pointed at a production database URL (Supabase/AWS) and aborts the execution to prevent data loss.
