import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.cateringCategory.count();
    const items = await prisma.cateringItem.count();
    const requests = await prisma.cateringRequest.count();

    console.log(`Summary:`);
    console.log(`- Catering Categories: ${categories}`);
    console.log(`- Catering Items: ${items}`);
    console.log(`- Catering Requests: ${requests}`);

    if (items > 0) {
        const firstItems = await prisma.cateringItem.findMany({ take: 5 });
        console.log("\nSample Items:");
        console.log(JSON.stringify(firstItems, null, 2));
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
