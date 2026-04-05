import { describe, it, expect, beforeEach } from "vitest";

// Cart types (should match src/lib/cart.tsx)
interface CartItem {
    menuItemId: string;
    name: string;
    priceCents: number;
    quantity: number;
    category: string;
}

interface Cart {
    items: CartItem[];
    subtotalCents: number;
    taxCents: number;
    totalCents: number;
}

// Mock cart functions
function createEmptyCart(): Cart {
    return {
        items: [],
        subtotalCents: 0,
        taxCents: 0,
        totalCents: 0,
    };
}

function addItemToCart(cart: Cart, item: CartItem): Cart {
    const existing = cart.items.find((i) => i.menuItemId === item.menuItemId);

    if (existing) {
        existing.quantity += item.quantity;
    } else {
        cart.items.push(item);
    }

    return recalculateCart(cart);
}

function removeItemFromCart(cart: Cart, menuItemId: string): Cart {
    cart.items = cart.items.filter((i) => i.menuItemId !== menuItemId);
    return recalculateCart(cart);
}

function updateItemQuantity(cart: Cart, menuItemId: string, quantity: number): Cart {
    const item = cart.items.find((i) => i.menuItemId === menuItemId);
    if (item) {
        if (quantity <= 0) {
            return removeItemFromCart(cart, menuItemId);
        }
        item.quantity = quantity;
    }
    return recalculateCart(cart);
}

function recalculateCart(cart: Cart): Cart {
    const subtotalCents = cart.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
    const taxCents = Math.round(subtotalCents * 0.08); // 8% tax
    const totalCents = subtotalCents + taxCents;

    return {
        ...cart,
        subtotalCents,
        taxCents,
        totalCents,
    };
}

function clearCart(): Cart {
    return createEmptyCart();
}

describe("Cart State Management", () => {
    let cart: Cart;

    beforeEach(() => {
        cart = createEmptyCart();
    });

    describe("Cart initialization", () => {
        it("should create empty cart", () => {
            expect(cart.items).toHaveLength(0);
            expect(cart.subtotalCents).toBe(0);
            expect(cart.taxCents).toBe(0);
            expect(cart.totalCents).toBe(0);
        });

        it("should have zero totals", () => {
            expect(cart.subtotalCents).toBe(0);
            expect(cart.taxCents).toBe(0);
            expect(cart.totalCents).toBe(0);
        });
    });

    describe("Adding items to cart", () => {
        it("should add single item", () => {
            const item: CartItem = {
                menuItemId: "butter-chicken",
                name: "Butter Chicken",
                priceCents: 1299,
                quantity: 1,
                category: "Mains",
            };

            cart = addItemToCart(cart, item);

            expect(cart.items).toHaveLength(1);
            expect(cart.items[0].name).toBe("Butter Chicken");
            expect(cart.items[0].quantity).toBe(1);
        });

        it("should add multiple different items", () => {
            const item1: CartItem = {
                menuItemId: "item-1",
                name: "Butter Chicken",
                priceCents: 1299,
                quantity: 1,
                category: "Mains",
            };

            const item2: CartItem = {
                menuItemId: "item-2",
                name: "Samosa",
                priceCents: 599,
                quantity: 2,
                category: "Starters",
            };

            cart = addItemToCart(cart, item1);
            cart = addItemToCart(cart, item2);

            expect(cart.items).toHaveLength(2);
            expect(cart.items[0].name).toBe("Butter Chicken");
            expect(cart.items[1].name).toBe("Samosa");
        });

        it("should merge quantities of same item", () => {
            const item: CartItem = {
                menuItemId: "butter-chicken",
                name: "Butter Chicken",
                priceCents: 1299,
                quantity: 1,
                category: "Mains",
            };

            cart = addItemToCart(cart, item);
            cart = addItemToCart(cart, item);

            expect(cart.items).toHaveLength(1);
            expect(cart.items[0].quantity).toBe(2);
        });
    });

    describe("Cart calculations", () => {
        it("should calculate subtotal correctly", () => {
            const item1: CartItem = {
                menuItemId: "item-1",
                name: "Item 1",
                priceCents: 1000,
                quantity: 2,
                category: "Test",
            };

            const item2: CartItem = {
                menuItemId: "item-2",
                name: "Item 2",
                priceCents: 500,
                quantity: 1,
                category: "Test",
            };

            cart = addItemToCart(cart, item1);
            cart = addItemToCart(cart, item2);

            // 1000*2 + 500*1 = 2500
            expect(cart.subtotalCents).toBe(2500);
        });

        it("should calculate tax at 8%", () => {
            const item: CartItem = {
                menuItemId: "item-1",
                name: "Item",
                priceCents: 1000,
                quantity: 1,
                category: "Test",
            };

            cart = addItemToCart(cart, item);

            // 1000 * 0.08 = 80
            expect(cart.taxCents).toBe(80);
        });

        it("should calculate total (subtotal + tax)", () => {
            const item: CartItem = {
                menuItemId: "item-1",
                name: "Item",
                priceCents: 1250, // Will have $10 subtotal, $0.80 tax
                quantity: 1,
                category: "Test",
            };

            cart = addItemToCart(cart, item);

            // 1250 + 100 = 1350
            expect(cart.totalCents).toBe(1250 + 100); // 1250 * 0.08 = 100
        });
    });

    describe("Removing items from cart", () => {
        beforeEach(() => {
            const item1: CartItem = {
                menuItemId: "item-1",
                name: "Item 1",
                priceCents: 1000,
                quantity: 1,
                category: "Test",
            };

            const item2: CartItem = {
                menuItemId: "item-2",
                name: "Item 2",
                priceCents: 500,
                quantity: 1,
                category: "Test",
            };

            cart = addItemToCart(cart, item1);
            cart = addItemToCart(cart, item2);
        });

        it("should remove item from cart", () => {
            expect(cart.items).toHaveLength(2);

            cart = removeItemFromCart(cart, "item-1");

            expect(cart.items).toHaveLength(1);
            expect(cart.items[0].menuItemId).toBe("item-2");
        });

        it("should recalculate totals after removal", () => {
            cart = removeItemFromCart(cart, "item-1");

            // Only item-2 remains: 500 subtotal, 40 tax
            expect(cart.subtotalCents).toBe(500);
            expect(cart.taxCents).toBe(40);
        });

        it("should not error when removing non-existent item", () => {
            const initialLength = cart.items.length;

            cart = removeItemFromCart(cart, "non-existent");

            expect(cart.items).toHaveLength(initialLength);
        });
    });

    describe("Updating item quantities", () => {
        beforeEach(() => {
            const item: CartItem = {
                menuItemId: "item-1",
                name: "Item",
                priceCents: 1000,
                quantity: 2,
                category: "Test",
            };

            cart = addItemToCart(cart, item);
        });

        it("should increase quantity", () => {
            cart = updateItemQuantity(cart, "item-1", 5);

            expect(cart.items[0].quantity).toBe(5);
        });

        it("should decrease quantity", () => {
            cart = updateItemQuantity(cart, "item-1", 1);

            expect(cart.items[0].quantity).toBe(1);
        });

        it("should remove item when quantity set to 0", () => {
            cart = updateItemQuantity(cart, "item-1", 0);

            expect(cart.items).toHaveLength(0);
        });

        it("should recalculate totals after quantity update", () => {
            cart = updateItemQuantity(cart, "item-1", 10);

            // 1000 * 10 = 10000
            expect(cart.subtotalCents).toBe(10000);
        });
    });

    describe("Clearing cart", () => {
        beforeEach(() => {
            const item: CartItem = {
                menuItemId: "item-1",
                name: "Item",
                priceCents: 1000,
                quantity: 3,
                category: "Test",
            };

            cart = addItemToCart(cart, item);
        });

        it("should clear all items", () => {
            expect(cart.items).toHaveLength(1);

            cart = clearCart();

            expect(cart.items).toHaveLength(0);
        });

        it("should reset all totals", () => {
            cart = clearCart();

            expect(cart.subtotalCents).toBe(0);
            expect(cart.taxCents).toBe(0);
            expect(cart.totalCents).toBe(0);
        });
    });

    describe("Cart persistence", () => {
        it("should serialize cart to JSON", () => {
            const item: CartItem = {
                menuItemId: "item-1",
                name: "Item",
                priceCents: 1000,
                quantity: 1,
                category: "Test",
            };

            cart = addItemToCart(cart, item);

            const json = JSON.stringify(cart);
            const parsed = JSON.parse(json) as Cart;

            expect(parsed.items).toHaveLength(1);
            expect(parsed.subtotalCents).toBe(1000);
        });

        it("should deserialize cart from JSON", () => {
            const cartJson =
                '{"items":[{"menuItemId":"item-1","name":"Item","priceCents":1000,"quantity":2,"category":"Test"}],"subtotalCents":2000,"taxCents":160,"totalCents":2160}';

            const parsed = JSON.parse(cartJson) as Cart;

            expect(parsed.items).toHaveLength(1);
            expect(parsed.items[0].quantity).toBe(2);
            expect(parsed.subtotalCents).toBe(2000);
        });
    });

    describe("Edge cases", () => {
        it("should handle large quantities", () => {
            const item: CartItem = {
                menuItemId: "bulk-item",
                name: "Bulk Item",
                priceCents: 100,
                quantity: 1000,
                category: "Test",
            };

            cart = addItemToCart(cart, item);

            expect(cart.subtotalCents).toBe(100000);
        });

        it("should handle fractional prices (cents)", () => {
            const item: CartItem = {
                menuItemId: "fractional",
                name: "Item",
                priceCents: 1234, // $12.34
                quantity: 3,
                category: "Test",
            };

            cart = addItemToCart(cart, item);

            // 1234 * 3 = 3702, tax = 296
            expect(cart.subtotalCents).toBe(3702);
            expect(cart.taxCents).toBe(296);
        });

        it("should handle many items in cart", () => {
            for (let i = 0; i < 50; i++) {
                const item: CartItem = {
                    menuItemId: `item-${i}`,
                    name: `Item ${i}`,
                    priceCents: 1000 + i,
                    quantity: 1,
                    category: "Test",
                };

                cart = addItemToCart(cart, item);
            }

            expect(cart.items).toHaveLength(50);
            expect(cart.subtotalCents).toBeGreaterThan(0);
        });
    });
});
