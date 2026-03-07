import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });

    if (!settings) {
        console.log("SiteSettings 'global' is MISSING!");
    } else {
        console.log("SiteSettings 'global' found:");
        console.log(JSON.stringify(settings, null, 2));
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
