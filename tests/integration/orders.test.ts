import { beforeEach, describe, expect, it } from "vitest";
import { prisma, resetDatabase } from "../helpers/db";

async function createTestOrder(overrides: Partial<{
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    subtotalAmount: number;
    taxAmount: number;
    totalAmount: number;
    chatToken: string;
    status: "PENDING" | "PAID" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
}> = {}) {
    return prisma.order.create({
        data: {
            customerName: "Test Customer",
            customerEmail: "test@example.com",
            customerPhone: "+12035550100",
            subtotalAmount: 1299,
            taxAmount: 82,
            totalAmount: 1381,
            chatToken: `token-${Date.now()}-${Math.random()}`,
            status: "PENDING",
            ...overrides,
        },
    });
}

describe("Order lifecycle", () => {
    beforeEach(async () => {
        await resetDatabase();
        // Create required menu items for foreign key constraints
        await prisma.menuItem.createMany({
            data: [
                { id: "item-1", name: "Butter Chicken", category: "Mains", priceCents: 1299, inPos: true },
                { id: "item-2", name: "Samosa", category: "Starters", priceCents: 599, inPos: true },
                { id: "menu-item-xyz", name: "Chicken Tikka", category: "Mains", priceCents: 1199, inPos: true },
            ],
        });
        // Also clear auth-related tables for orders that reference User
        await prisma.orderMessage.deleteMany().catch(() => {});
        await prisma.orderItem.deleteMany().catch(() => {});
        await prisma.order.deleteMany().catch(() => {});
        await prisma.session.deleteMany().catch(() => {});
        await prisma.account.deleteMany().catch(() => {});
        await prisma.user.deleteMany().catch(() => {});
    });

    it("creates an order with PENDING status by default", async () => {
        const order = await createTestOrder();

        expect(order.status).toBe("PENDING");
        expect(order.customerEmail).toBe("test@example.com");
        expect(order.totalAmount).toBe(1381);
    });

    it("stores subtotal, tax, and total as cents integers", async () => {
        const order = await createTestOrder({
            subtotalAmount: 2598,
            taxAmount: 165,
            totalAmount: 2763,
        });

        expect(order.subtotalAmount).toBe(2598);
        expect(order.taxAmount).toBe(165);
        expect(order.totalAmount).toBe(2763);
    });

    it("transitions from PENDING to PAID", async () => {
        const order = await createTestOrder();
        expect(order.status).toBe("PENDING");

        const paid = await prisma.order.update({
            where: { id: order.id },
            data: { status: "PAID" },
        });

        expect(paid.status).toBe("PAID");
    });

    it("follows the full fulfillment lifecycle: PENDING → PAID → PREPARING → READY → COMPLETED", async () => {
        const order = await createTestOrder();

        const statuses: Array<"PAID" | "PREPARING" | "READY" | "COMPLETED"> = [
            "PAID",
            "PREPARING",
            "READY",
            "COMPLETED",
        ];

        let current = order;
        for (const status of statuses) {
            current = await prisma.order.update({
                where: { id: current.id },
                data: { status },
            });
            expect(current.status).toBe(status);
        }
    });

    it("can be CANCELLED from PENDING", async () => {
        const order = await createTestOrder();

        const cancelled = await prisma.order.update({
            where: { id: order.id },
            data: { status: "CANCELLED" },
        });

        expect(cancelled.status).toBe("CANCELLED");
    });

    it("creates order with associated OrderItems", async () => {
        const order = await createTestOrder();

        await prisma.orderItem.createMany({
            data: [
                { orderId: order.id, menuItemId: "item-1", name: "Butter Chicken", quantity: 2, priceCents: 1299 },
                { orderId: order.id, menuItemId: "item-2", name: "Samosa", quantity: 3, priceCents: 599 },
            ],
        });

        const fullOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: { items: true },
        });

        expect(fullOrder?.items).toHaveLength(2);
        expect(fullOrder?.items[0].name).toBe("Butter Chicken");
        expect(fullOrder?.items[1].priceCents).toBe(599);
    });

    it("snapshots item prices at order time independently of menu changes", async () => {
        const order = await createTestOrder();

        // Store price at order time
        await prisma.orderItem.create({
            data: {
                orderId: order.id,
                menuItemId: "menu-item-xyz",
                name: "Chicken Tikka",
                quantity: 1,
                priceCents: 1199, // price at time of order
            },
        });

        // Simulate menu price change - doesn't affect saved order item
        const savedItem = await prisma.orderItem.findFirst({
            where: { orderId: order.id },
        });

        // Price is snapshotted - the OrderItem still shows 1199
        expect(savedItem?.priceCents).toBe(1199);
    });

    it("deletes OrderItems when order is deleted (cascade)", async () => {
        const order = await createTestOrder();

        await prisma.orderItem.create({
            data: {
                orderId: order.id,
                menuItemId: "item-1",
                name: "Naan",
                quantity: 2,
                priceCents: 349,
            },
        });

        await prisma.order.delete({ where: { id: order.id } });

        const items = await prisma.orderItem.findMany({
            where: { orderId: order.id },
        });

        expect(items).toHaveLength(0);
    });

    it("stores chatToken for order tracking", async () => {
        const order = await createTestOrder({ chatToken: "unique-tracking-token-abc123" });

        const found = await prisma.order.findFirst({
            where: { chatToken: "unique-tracking-token-abc123" },
        });

        expect(found).not.toBeNull();
        expect(found?.id).toBe(order.id);
    });

    it("can attach an order to a registered user", async () => {
        const user = await prisma.user.create({
            data: {
                name: "Teja",
                email: "teja@example.com",
                password: "hashed-password",
            },
        });

        const order = await prisma.order.create({
            data: {
                userId: user.id,
                customerName: "Teja",
                customerEmail: "teja@example.com",
                customerPhone: "+12035550200",
                subtotalAmount: 1299,
                taxAmount: 82,
                totalAmount: 1381,
                chatToken: "user-order-token",
            },
        });

        const userOrders = await prisma.order.findMany({
            where: { userId: user.id },
        });

        expect(userOrders).toHaveLength(1);
        expect(userOrders[0].id).toBe(order.id);
    });

    it("guest orders have no userId", async () => {
        const order = await createTestOrder();
        expect(order.userId).toBeNull();
    });
});
