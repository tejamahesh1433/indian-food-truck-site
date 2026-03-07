import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting database cleanup for duplicated catering items...");

    const items = await prisma.cateringItem.findMany({
        orderBy: { createdAt: "asc" },
    });

    const seen = new Set<string>();
    const toDelete: string[] = [];

    for (const item of items) {
        const key = `${item.category}:${item.name}`.toLowerCase();
        if (seen.has(key)) {
            toDelete.push(item.id);
        } else {
            seen.add(key);
        }
    }

    if (toDelete.length === 0) {
        console.log("No duplicates found.");
        return;
    }

    console.log(`Found ${toDelete.length} duplicate items. Deleting...`);

    const result = await prisma.cateringItem.deleteMany({
        where: {
            id: { in: toDelete },
        },
    });

    console.log(`Successfully deleted ${result.count} items.`);
}

main()
    .catch(e => {
        console.error("Cleanup failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
