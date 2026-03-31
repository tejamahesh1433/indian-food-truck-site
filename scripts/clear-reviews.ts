import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- CLEARING ALL REVIEWS ---');
  
  const deleted = await prisma.review.deleteMany({});
  
  console.log(`Successfully deleted ${deleted.count} reviews.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
