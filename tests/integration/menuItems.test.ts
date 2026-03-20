import { beforeEach, describe, expect, it } from "vitest";
import { prisma, resetDatabase } from "../helpers/db";

describe("MenuItem CRUD", () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it("creates a menu item with required fields", async () => {
        const item = await prisma.menuItem.create({
            data: {
                name: "Butter Chicken",
                category: "Mains",
                priceCents: 1299,
                isAvailable: true,
                inPos: true,
            },
        });

        expect(item.name).toBe("Butter Chicken");
        expect(item.priceCents).toBe(1299);
        expect(item.isAvailable).toBe(true);
        expect(item.isVeg).toBe(false); // default
        expect(item.isSpicy).toBe(false); // default
        expect(item.sortOrder).toBe(0); // default
    });

    it("creates a vegetarian menu item", async () => {
        const item = await prisma.menuItem.create({
            data: {
                name: "Paneer Tikka",
                category: "Starters",
                priceCents: 999,
                isVeg: true,
                isAvailable: true,
                inPos: true,
            },
        });

        expect(item.isVeg).toBe(true);
    });

    it("creates a spicy and popular menu item", async () => {
        const item = await prisma.menuItem.create({
            data: {
                name: "Lamb Vindaloo",
                category: "Mains",
                priceCents: 1499,
                isSpicy: true,
                isPopular: true,
                isAvailable: true,
                inPos: true,
            },
        });

        expect(item.isSpicy).toBe(true);
        expect(item.isPopular).toBe(true);
    });

    it("updates item availability", async () => {
        const item = await prisma.menuItem.create({
            data: {
                name: "Samosa",
                category: "Starters",
                priceCents: 599,
                isAvailable: true,
                inPos: true,
            },
        });

        const updated = await prisma.menuItem.update({
            where: { id: item.id },
            data: { isAvailable: false },
        });

        expect(updated.isAvailable).toBe(false);
    });

    it("updates item price", async () => {
        const item = await prisma.menuItem.create({
            data: {
                name: "Mango Lassi",
                category: "Drinks",
                priceCents: 499,
                isAvailable: true,
                inPos: true,
            },
        });

        const updated = await prisma.menuItem.update({
            where: { id: item.id },
            data: { priceCents: 549 },
        });

        expect(updated.priceCents).toBe(549);
    });

    it("updates sort order", async () => {
        const item = await prisma.menuItem.create({
            data: {
                name: "Naan",
                category: "Breads",
                priceCents: 349,
                sortOrder: 0,
                isAvailable: true,
                inPos: true,
            },
        });

        const updated = await prisma.menuItem.update({
            where: { id: item.id },
            data: { sortOrder: 3 },
        });

        expect(updated.sortOrder).toBe(3);
    });

    it("deletes a menu item", async () => {
        const item = await prisma.menuItem.create({
            data: {
                name: "To Be Deleted",
                category: "Starters",
                priceCents: 499,
                isAvailable: true,
                inPos: true,
            },
        });

        await prisma.menuItem.delete({ where: { id: item.id } });

        const found = await prisma.menuItem.findUnique({ where: { id: item.id } });
        expect(found).toBeNull();
    });

    it("fetches only available items", async () => {
        await prisma.menuItem.createMany({
            data: [
                { name: "Available Item", category: "Mains", priceCents: 1000, isAvailable: true, inPos: true },
                { name: "Unavailable Item", category: "Mains", priceCents: 1200, isAvailable: false, inPos: true },
            ],
        });

        const available = await prisma.menuItem.findMany({
            where: { isAvailable: true },
        });

        expect(available.length).toBe(1);
        expect(available[0].name).toBe("Available Item");
    });

    it("fetches items sorted by sortOrder", async () => {
        await prisma.menuItem.createMany({
            data: [
                { name: "Third", category: "Mains", priceCents: 1000, sortOrder: 3, isAvailable: true, inPos: true },
                { name: "First", category: "Mains", priceCents: 1000, sortOrder: 1, isAvailable: true, inPos: true },
                { name: "Second", category: "Mains", priceCents: 1000, sortOrder: 2, isAvailable: true, inPos: true },
            ],
        });

        const items = await prisma.menuItem.findMany({
            orderBy: { sortOrder: "asc" },
        });

        expect(items[0].name).toBe("First");
        expect(items[1].name).toBe("Second");
        expect(items[2].name).toBe("Third");
    });
});
