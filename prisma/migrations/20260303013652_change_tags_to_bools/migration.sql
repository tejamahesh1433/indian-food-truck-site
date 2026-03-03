/*
  Warnings:

  - You are about to drop the column `tags` on the `MenuItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "tags",
ADD COLUMN     "isPopular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSpicy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVeg" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "MenuItem_category_isAvailable_idx" ON "MenuItem"("category", "isAvailable");
