/*
  Warnings:

  - You are about to drop the column `email` on the `MarketplaceEntry` table. All the data in the column will be lost.
  - You are about to drop the column `publicEmail` on the `MarketplaceEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MarketplaceEntry" DROP COLUMN "email",
DROP COLUMN "publicEmail",
ADD COLUMN     "anonym" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "companyId" TEXT;

-- CreateIndex
CREATE INDEX "MarketplaceEntry_companyId_idx" ON "MarketplaceEntry"("companyId");

-- AddForeignKey
ALTER TABLE "MarketplaceEntry" ADD CONSTRAINT "MarketplaceEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
