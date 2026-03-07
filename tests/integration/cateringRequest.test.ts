import { beforeEach, describe, expect, it } from "vitest";
import { prisma, resetDatabase } from "../helpers/db";

describe("catering request db", () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it("creates a catering request", async () => {
        const request = await prisma.cateringRequest.create({
            data: {
                name: "Test Customer",
                email: "test@example.com",
                phone: "+12035550111",
                eventDate: "2026-03-20",
                guests: "50",
                location: "New Haven",
                notes: "Need veg options",
                status: "NEW",
                chatToken: "test-token-123"
            }
        });

        expect(request.name).toBe("Test Customer");
        expect(request.status).toBe("NEW");
        expect(request.chatToken).toBe("test-token-123");
    });

    it("updates catering status", async () => {
        const request = await prisma.cateringRequest.create({
            data: {
                name: "Status User",
                email: "status@example.com",
                phone: "+12035550222",
                eventDate: "2026-03-25",
                guests: "40",
                location: "Hartford",
                status: "NEW",
                chatToken: "status-token-123"
            }
        });

        const updated = await prisma.cateringRequest.update({
            where: { id: request.id },
            data: { status: "CONTACTED" }
        });

        expect(updated.status).toBe("CONTACTED");
    });
});
