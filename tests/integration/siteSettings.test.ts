import { beforeEach, describe, expect, it } from "vitest";
import { prisma, resetDatabase, seedBasicData } from "../helpers/db";

describe("site settings db", () => {
    beforeEach(async () => {
        await resetDatabase();
        await seedBasicData();
    });

    it("stores site settings correctly", async () => {
        const settings = await prisma.siteSettings.findFirst();

        expect(settings).not.toBeNull();
        expect(settings?.businessName).toBe("Indian Food Truck");
        expect(settings?.instagramUrl).toBe("https://instagram.com/indianfoodtruck");
    });
});
