import { describe, it, expect } from "vitest";
import { buildRequestNotes } from "@/lib/utils/cateringSummary";

describe("buildRequestNotes", () => {
    it("builds a readable catering summary", () => {
        const text = buildRequestNotes([
            {
                id: "cur1",
                name: "Chicken Tikka Masala",
                quantity: 2,
                selectedOptions: {
                    "Tray Size": "Full Tray",
                    "Spice Level": "Medium"
                }
            }
        ]);

        expect(text).toContain("Selected Catering Items:");
        expect(text).toContain("Chicken Tikka Masala");
        expect(text).toContain("Tray Size: Full Tray");
        expect(text).toContain("Qty 2");
    });
});
