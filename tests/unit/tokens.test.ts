import { describe, it, expect } from "vitest";
import { makeChatToken } from "@/lib/tokens";

describe("makeChatToken", () => {
    it("generates a non-empty string", () => {
        const token = makeChatToken();
        expect(typeof token).toBe("string");
        expect(token.length).toBeGreaterThan(0);
    });

    it("generates a sufficiently long token (at least 30 characters)", () => {
        const token = makeChatToken();
        expect(token.length).toBeGreaterThanOrEqual(30);
    });

    it("generates unique tokens on every call", () => {
        const tokens = new Set(Array.from({ length: 20 }, () => makeChatToken()));
        expect(tokens.size).toBe(20);
    });

    it("only contains URL-safe characters", () => {
        const token = makeChatToken();
        expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    });
});
