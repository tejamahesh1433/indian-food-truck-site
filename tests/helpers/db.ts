import { PrismaClient } from "@prisma/client";

// Safety check to ensure we don't wipe production
if (process.env.DATABASE_URL?.includes("supabase.com") || process.env.DATABASE_URL?.includes("aws")) {
    throw new Error("CRITICAL: Integration tests are pointing to PRODUCTION database! Aborting to prevent data loss.");
}

export const prisma = new PrismaClient();

export async function resetDatabase() {
    // Order matters for foreign keys
    await prisma.cateringMessage.deleteMany().catch(() => { });
    await prisma.cateringRequest.deleteMany().catch(() => { });
    await prisma.cateringItem.deleteMany().catch(() => { });
    await prisma.cateringCategory.deleteMany().catch(() => { });
    await prisma.orderItem.deleteMany().catch(() => { });
    await prisma.order.deleteMany().catch(() => { });
    await prisma.menuItem.deleteMany().catch(() => { });
    await prisma.menuCategory.deleteMany().catch(() => { });
    await prisma.siteSettings.deleteMany().catch(() => { });
    await prisma.savedLocation.deleteMany().catch(() => { });
    await prisma.session.deleteMany().catch(() => { });
    await prisma.account.deleteMany().catch(() => { });
    await prisma.verificationToken.deleteMany().catch(() => { });
    await prisma.user.deleteMany().catch(() => { });
}

export async function seedBasicData() {
    await prisma.siteSettings.create({
        data: {
            id: "global",
            phone: "+14155550198",
            instagramUrl: "https://instagram.com/indianfoodtruck",
            publicEmail: "info@indianfoodtruck.com",
            businessName: "Indian Food Truck",
            cityState: "Hartford, CT",
            footerMessage: "Authentic Indian street food on wheels.",
            todayStatus: "CLOSED"
        }
    }).catch((e) => console.error("Seed SiteSettings failed", e));

    await prisma.menuItem.createMany({
        data: [
            {
                name: "Butter Chicken",
                category: "Mains",
                priceCents: 1299,
                description: "Creamy tomato curry.",
                isPopular: true,
                isAvailable: true,
                inPos: true
            },
            {
                name: "Samosa",
                category: "Starters",
                priceCents: 599,
                description: "Crispy potato pastry.",
                isVeg: true,
                isAvailable: true,
                inPos: true
            }
        ],
        skipDuplicates: true
    }).catch((e) => console.error("Seed MenuItem failed", e));
}
