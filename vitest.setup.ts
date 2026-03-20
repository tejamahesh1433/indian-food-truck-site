import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.test and override process.env BEFORE any test module is imported.
// This ensures integration test helpers (like db.ts) see the local test DB URL,
// not the production Supabase URL from .env.
try {
    const envTestPath = resolve(process.cwd(), ".env.test");
    const content = readFileSync(envTestPath, "utf-8");
    for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let value = trimmed.slice(eqIdx + 1).trim();
        // Strip surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        process.env[key] = value;
    }
} catch {
    // .env.test not present — integration tests will use whatever is in process.env
}

import "@testing-library/jest-dom";
