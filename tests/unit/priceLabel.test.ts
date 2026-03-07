import { describe, it, expect } from "vitest";
import { priceLabel } from "@/lib/utils/priceLabel";

describe("priceLabel", () => {
    it("formats per person pricing", () => {
        expect(
            priceLabel({ kind: "PER_PERSON", amount: 14, minPeople: 20 })
        ).toBe("$14/person • 20 person min");
    });

    it("formats tray pricing", () => {
        expect(
            priceLabel({ kind: "TRAY", half: 65, full: 110 })
        ).toBe("Half $65 • Full $110");
    });

    it("formats specific tray size selection", () => {
        expect(
            priceLabel({ kind: "TRAY", half: 65, full: 110 }, { selectedSize: "Half Tray" })
        ).toBe("$65 (Half Tray)");
    });

    it("formats fixed pricing", () => {
        expect(
            priceLabel({ kind: "FIXED", amount: 30, unit: "gallon" })
        ).toBe("$30/gallon");
    });
});
