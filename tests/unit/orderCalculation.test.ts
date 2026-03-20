import { describe, it, expect } from "vitest";

// Order calculation logic mirrored from src/app/api/orders/route.ts
// Tax rate: 6.35% CT Sales Tax
const TAX_RATE = 0.0635;

function calculateOrderTotals(items: { priceCents: number; quantity: number }[]) {
    const subtotalAmount = items.reduce(
        (acc, item) => acc + item.priceCents * item.quantity,
        0
    );
    const taxAmount = Math.round(subtotalAmount * TAX_RATE);
    const totalAmount = subtotalAmount + taxAmount;
    return { subtotalAmount, taxAmount, totalAmount };
}

describe("Order total calculation", () => {
    it("calculates correct subtotal for a single item", () => {
        const { subtotalAmount } = calculateOrderTotals([
            { priceCents: 1299, quantity: 1 },
        ]);
        expect(subtotalAmount).toBe(1299);
    });

    it("calculates correct subtotal for multiple items and quantities", () => {
        const { subtotalAmount } = calculateOrderTotals([
            { priceCents: 1299, quantity: 2 }, // 2598
            { priceCents: 599, quantity: 3 },  // 1797
        ]);
        expect(subtotalAmount).toBe(4395);
    });

    it("calculates CT sales tax at 6.35%", () => {
        const { taxAmount } = calculateOrderTotals([
            { priceCents: 1000, quantity: 1 },
        ]);
        // 1000 * 0.0635 = 63.5 → rounds to 64
        expect(taxAmount).toBe(64);
    });

    it("rounds tax to nearest cent", () => {
        const { taxAmount } = calculateOrderTotals([
            { priceCents: 599, quantity: 1 },
        ]);
        // 599 * 0.0635 = 38.0365 → rounds to 38
        expect(taxAmount).toBe(38);
    });

    it("calculates correct total as subtotal + tax", () => {
        const { subtotalAmount, taxAmount, totalAmount } = calculateOrderTotals([
            { priceCents: 1299, quantity: 2 },
        ]);
        expect(totalAmount).toBe(subtotalAmount + taxAmount);
    });

    it("returns zero for an empty order", () => {
        const { subtotalAmount, taxAmount, totalAmount } = calculateOrderTotals([]);
        expect(subtotalAmount).toBe(0);
        expect(taxAmount).toBe(0);
        expect(totalAmount).toBe(0);
    });

    it("handles large orders correctly", () => {
        const { subtotalAmount, totalAmount } = calculateOrderTotals([
            { priceCents: 2500, quantity: 10 }, // $250.00
        ]);
        expect(subtotalAmount).toBe(25000);
        expect(totalAmount).toBeGreaterThan(25000);
    });

    it("total is always greater than or equal to subtotal", () => {
        const { subtotalAmount, totalAmount } = calculateOrderTotals([
            { priceCents: 999, quantity: 3 },
        ]);
        expect(totalAmount).toBeGreaterThanOrEqual(subtotalAmount);
    });
});
