import { describe, it, expect } from "vitest";
import { normalizePhone } from "@/lib/utils/phone";

describe("normalizePhone", () => {
    it("normalizes a 10 digit number", () => {
        expect(normalizePhone("(415) 555-0198")).toBe("+14155550198");
    });

    it("preserves an 11 digit US number", () => {
        expect(normalizePhone("+1 415-555-0198")).toBe("+14155550198");
    });
});
