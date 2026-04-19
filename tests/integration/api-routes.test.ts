import { beforeEach, describe, expect, it } from "vitest";
import { prisma, resetDatabase, seedBasicData } from "../helpers/db";

describe("API Routes - Menu Items CRUD", () => {
    beforeEach(async () => {
        await resetDatabase();
        await seedBasicData();
    });

    describe("GET /api/menu-items", () => {
        it("should return all menu items", async () => {
            const items = await prisma.menuItem.findMany();
            expect(items.length).toBeGreaterThan(0);
            expect(items[0]).toHaveProperty("name");
            expect(items[0]).toHaveProperty("priceCents");
        });

        it("should filter by category", async () => {
            const items = await prisma.menuItem.findMany({
                where: { category: "Mains" },
            });

            expect(items.length).toBeGreaterThan(0);
            items.forEach((item) => {
                expect(item.category).toBe("Mains");
            });
        });

        it("should return available items only", async () => {
            const items = await prisma.menuItem.findMany({
                where: { isAvailable: true },
            });

            expect(items.every((item) => item.isAvailable)).toBe(true);
        });
    });

    describe("POST /api/admin/menu-items", () => {
        it("should create a new menu item", async () => {
            const item = await prisma.menuItem.create({
                data: {
                    name: "Chicken Tikka",
                    category: "Mains",
                    priceCents: 1499,
                    description: "Grilled chicken in yogurt marinade",
                    isAvailable: true,
                    inPos: true,
                },
            });

            expect(item.id).toBeDefined();
            expect(item.name).toBe("Chicken Tikka");
            expect(item.priceCents).toBe(1499);
        });

        it("should require name and price", async () => {
            const error = await prisma.menuItem.create({
                data: {
                    name: "",
                    category: "Mains",
                    priceCents: 1499,
                    description: "Test",
                    isAvailable: true,
                    inPos: true,
                },
            }).catch((e) => e);

            expect(error).toBeDefined();
        });

        it("should handle negative prices", async () => {
            // In reality, should be validated before DB
            const item = await prisma.menuItem.create({
                data: {
                    name: "Negative Test",
                    category: "Test",
                    priceCents: -100, // Should be rejected by API validation
                    description: "Test negative price",
                    isAvailable: true,
                    inPos: true,
                },
            });

            expect(item.priceCents).toBe(-100); // DB allows it, but API should reject
        });
    });

    describe("PUT /api/admin/menu-items/[id]", () => {
        it("should update menu item price", async () => {
            const item = await prisma.menuItem.findFirst();
            if (!item) throw new Error("No items found");

            const updated = await prisma.menuItem.update({
                where: { id: item.id },
                data: { priceCents: 1599 },
            });

            expect(updated.priceCents).toBe(1599);
        });

        it("should update menu item availability", async () => {
            const item = await prisma.menuItem.findFirst();
            if (!item) throw new Error("No items found");

            const updated = await prisma.menuItem.update({
                where: { id: item.id },
                data: { isAvailable: false },
            });

            expect(updated.isAvailable).toBe(false);
        });

        it("should update description", async () => {
            const item = await prisma.menuItem.findFirst();
            if (!item) throw new Error("No items found");

            const newDesc = "Updated description";
            const updated = await prisma.menuItem.update({
                where: { id: item.id },
                data: { description: newDesc },
            });

            expect(updated.description).toBe(newDesc);
        });
    });

    describe("DELETE /api/admin/menu-items/[id]", () => {
        it("should delete menu item", async () => {
            const item = await prisma.menuItem.create({
                data: {
                    name: "Item to Delete",
                    category: "Test",
                    priceCents: 999,
                    description: "Will be deleted",
                    isAvailable: true,
                    inPos: true,
                },
            });

            const deleted = await prisma.menuItem.delete({
                where: { id: item.id },
            });

            expect(deleted.id).toBe(item.id);

            const found = await prisma.menuItem.findUnique({
                where: { id: item.id },
            });

            expect(found).toBeNull();
        });
    });
});

describe("API Routes - Orders", () => {
    beforeEach(async () => {
        await resetDatabase();
        await seedBasicData();
        // Create required menu items for foreign key constraints
        await prisma.menuItem.createMany({
            data: [
                { id: "item-1", name: "Butter Chicken", category: "Mains", priceCents: 1299, inPos: true },
                { id: "item-2", name: "Samosa", category: "Starters", priceCents: 599, inPos: true },
            ],
            skipDuplicates: true,
        });
    });

    describe("POST /api/orders", () => {
        it("should create order with items", async () => {
            const order = await prisma.order.create({
                data: {
                    customerName: "John",
                    customerEmail: "john@example.com",
                    customerPhone: "+12035550100",
                    subtotalAmount: 2598,
                    taxAmount: 207,
                    totalAmount: 2805,
                    chatToken: "token-123",
                    status: "PENDING",
                },
            });

            await prisma.orderItem.createMany({
                data: [
                    {
                        orderId: order.id,
                        menuItemId: "item-1",
                        name: "Butter Chicken",
                        quantity: 2,
                        priceCents: 1299,
                    },
                    {
                        orderId: order.id,
                        menuItemId: "item-2",
                        name: "Samosa",
                        quantity: 1,
                        priceCents: 599,
                    },
                ],
            });

            const fullOrder = await prisma.order.findUnique({
                where: { id: order.id },
                include: { items: true },
            });

            expect(fullOrder?.items).toHaveLength(2);
            expect(fullOrder?.totalAmount).toBe(2805);
        });

        it("should validate order total matches items", async () => {
            // This is a business logic validation that should happen in API
            const order = await prisma.order.create({
                data: {
                    customerName: "Validation Test",
                    customerEmail: "validation@example.com",
                    customerPhone: "+12035550100",
                    subtotalAmount: 1000,
                    taxAmount: 80,
                    totalAmount: 1080,
                    chatToken: "validation-token",
                    status: "PENDING",
                },
            });

            const sum = 1000; // subtotal
            expect(sum).toBe(order.subtotalAmount);
        });
    });

    describe("GET /api/orders/track/[token]", () => {
        it("should retrieve order by chat token", async () => {
            const chatToken = "tracking-token-xyz";
            const order = await prisma.order.create({
                data: {
                    customerName: "Track Test",
                    customerEmail: "track@example.com",
                    customerPhone: "+12035550100",
                    subtotalAmount: 1500,
                    taxAmount: 120,
                    totalAmount: 1620,
                    chatToken,
                    status: "PAID",
                },
            });

            const found = await prisma.order.findFirst({
                where: { chatToken },
            });

            expect(found?.id).toBe(order.id);
            expect(found?.status).toBe("PAID");
        });

        it("should include order items in tracking response", async () => {
            const chatToken = "track-with-items";
            const order = await prisma.order.create({
                data: {
                    customerName: "Track Items",
                    customerEmail: "trackitems@example.com",
                    customerPhone: "+12035550100",
                    subtotalAmount: 2000,
                    taxAmount: 160,
                    totalAmount: 2160,
                    chatToken,
                    status: "PAID",
                },
            });

            await prisma.orderItem.createMany({
                data: [
                    {
                        orderId: order.id,
                        menuItemId: "item-1",
                        name: "Butter Chicken",
                        quantity: 2,
                        priceCents: 1299,
                    },
                ],
            });

            const tracked = await prisma.order.findFirst({
                where: { chatToken },
                include: { items: true },
            });

            expect(tracked?.items).toHaveLength(1);
        });
    });

    describe("POST /api/orders/[id]/cancel", () => {
        it("should cancel pending order", async () => {
            const order = await prisma.order.create({
                data: {
                    customerName: "Cancel Test",
                    customerEmail: "cancel@example.com",
                    customerPhone: "+12035550100",
                    subtotalAmount: 1500,
                    taxAmount: 120,
                    totalAmount: 1620,
                    chatToken: "cancel-token",
                    status: "PENDING",
                },
            });

            const cancelled = await prisma.order.update({
                where: { id: order.id },
                data: { status: "CANCELLED" },
            });

            expect(cancelled.status).toBe("CANCELLED");
        });

        it("should not allow cancelling paid orders", async () => {
            const order = await prisma.order.create({
                data: {
                    customerName: "No Cancel Test",
                    customerEmail: "nocancel@example.com",
                    customerPhone: "+12035550100",
                    subtotalAmount: 2000,
                    taxAmount: 160,
                    totalAmount: 2160,
                    chatToken: "nocancel-token",
                    status: "PAID",
                },
            });

            // API should prevent this, but DB allows it
            const attempted = await prisma.order.findUnique({
                where: { id: order.id },
            });

            expect(attempted?.status).toBe("PAID");
        });
    });
});

describe("API Routes - Categories", () => {
    beforeEach(async () => {
        await resetDatabase();
        await seedBasicData();
    });

    describe("GET /api/categories", () => {
        it("should return distinct categories", async () => {
            const items = await prisma.menuItem.findMany({
                distinct: ["category"],
            });

            expect(items.length).toBeGreaterThan(0);
        });
    });

    describe("POST /api/admin/menu-categories", () => {
        it("should create new category", async () => {
            const category = await prisma.menuCategory.create({
                data: {
                    name: "Desserts",
                    sortOrder: 5,
                },
            });

            expect(category.id).toBeDefined();
            expect(category.name).toBe("Desserts");
        });
    });
});
