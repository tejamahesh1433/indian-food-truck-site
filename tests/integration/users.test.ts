import { beforeEach, describe, expect, it } from "vitest";
import { prisma, resetDatabase } from "../helpers/db";

describe("User management", () => {
    beforeEach(async () => {
        await prisma.orderMessage.deleteMany().catch(() => {});
        await prisma.orderItem.deleteMany().catch(() => {});
        await prisma.order.deleteMany().catch(() => {});
        await prisma.session.deleteMany().catch(() => {});
        await prisma.account.deleteMany().catch(() => {});
        await prisma.user.deleteMany().catch(() => {});
        await resetDatabase();
    });

    it("creates a user with email and hashed password", async () => {
        // Simulate a bcrypt hash (real hashing would be done by the API)
        const fakeBcryptHash = "$2b$12$fakehashfortesting1234567890abcdefghijklmno";

        const user = await prisma.user.create({
            data: {
                name: "Teja Mahesh",
                email: "teja@example.com",
                password: fakeBcryptHash,
            },
        });

        expect(user.email).toBe("teja@example.com");
        expect(user.name).toBe("Teja Mahesh");
        // Password stored is the hash, not plaintext
        expect(user.password).toBe(fakeBcryptHash);
        expect(user.password).not.toBe("plaintextpassword");
    });

    it("enforces unique email constraint", async () => {
        await prisma.user.create({
            data: {
                email: "unique@example.com",
                password: "hash1",
            },
        });

        await expect(
            prisma.user.create({
                data: {
                    email: "unique@example.com",
                    password: "hash2",
                },
            })
        ).rejects.toThrow();
    });

    it("allows users with null email (for OAuth accounts)", async () => {
        const user = await prisma.user.create({
            data: {
                name: "OAuth User",
                email: null,
            },
        });

        expect(user.email).toBeNull();
    });

    it("creates a user without a name", async () => {
        const user = await prisma.user.create({
            data: {
                email: "noname@example.com",
                password: "hash",
            },
        });

        expect(user.name).toBeNull();
    });

    it("finds a user by email", async () => {
        await prisma.user.create({
            data: {
                email: "findme@example.com",
                password: "hash",
            },
        });

        const found = await prisma.user.findUnique({
            where: { email: "findme@example.com" },
        });

        expect(found).not.toBeNull();
        expect(found?.email).toBe("findme@example.com");
    });

    it("returns null when user email does not exist", async () => {
        const found = await prisma.user.findUnique({
            where: { email: "nonexistent@example.com" },
        });

        expect(found).toBeNull();
    });

    it("user has timestamps set automatically", async () => {
        const before = new Date();
        const user = await prisma.user.create({
            data: {
                email: "timestamps@example.com",
                password: "hash",
            },
        });
        const after = new Date();

        // Allow a small tolerance for JS/DB clock precision differences
        expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime() + 10);
    });

    it("deletes a user", async () => {
        const user = await prisma.user.create({
            data: {
                email: "delete@example.com",
                password: "hash",
            },
        });

        await prisma.user.delete({ where: { id: user.id } });

        const found = await prisma.user.findUnique({ where: { id: user.id } });
        expect(found).toBeNull();
    });

    it("user orders are accessible via relation", async () => {
        const user = await prisma.user.create({
            data: {
                email: "orders@example.com",
                password: "hash",
            },
        });

        await prisma.order.create({
            data: {
                userId: user.id,
                customerName: "Orders User",
                customerEmail: "orders@example.com",
                customerPhone: "+12035550300",
                subtotalAmount: 1299,
                taxAmount: 82,
                totalAmount: 1381,
                chatToken: "relation-test-token",
            },
        });

        const userWithOrders = await prisma.user.findUnique({
            where: { id: user.id },
            include: { orders: true },
        });

        expect(userWithOrders?.orders).toHaveLength(1);
        expect(userWithOrders?.orders[0].customerEmail).toBe("orders@example.com");
    });
});
