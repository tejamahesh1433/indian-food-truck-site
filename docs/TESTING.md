# Testing Manual

The system uses a 3-layer automated testing strategy to ensure reliability across logic, database, and browser interactions.

---

## 🚀 Running Tests

### Unit & Integration (Vitest)
```bash
# Run all vitest tests
npm run test:unit
npm run test:integration

# Run in watch mode (recommended for development)
npm run test:watch
```

### End-to-End (Playwright)
```bash
# Run all e2e tests
npm run test:e2e

# Open Playwright UI (Time-travel debugging)
npm run test:e2e:ui
```

### Code Coverage
The project is configured with `v8` for coverage reporting.
```bash
npm run coverage
```
Reports are generated in the `./coverage` directory.

---

## 🧪 Testing Infrastructure

### 1. Environment Isolation
All tests strictly use `.env.test`. 
> [!IMPORTANT]
> **Safety Guard**: The file `tests/helpers/db.ts` contains a script that checks the `DATABASE_URL`. If it detects a production host (Supabase/AWS), the test suite will immediately abort to prevent accidental data loss.

### 2. Admin Authentication (`adminPage` fixture)
To test protected routes without re-writing login logic, use the custom `adminPage` fixture:
```typescript
import { test, expect } from "../helpers/admin-auth";

test("can access dashboard", async ({ adminPage }) => {
    // page is already logged in
    await adminPage.goto("/admin");
    await expect(adminPage.getByText(/recent activity/i)).toBeVisible();
});
```

### 3. Database Helpers
- `resetDatabase()`: Wipes all tables in the test DB before each test.
- `seedBasicData()`: Popularizes the test DB with standard categories and items for consistent testing.

---

## 🛠 Troubleshooting Tests

- **Hydration Errors**: Ensure `jsdom` is the environment for Vitest component tests.
- **Port Conflicts**: Playwright's `webServer` is configured to reuse an existing server at `127.0.0.1:3000`.
- **Timeouts**: If Vercel/CI is slow, you can increase the timeout in `playwright.config.ts`.
