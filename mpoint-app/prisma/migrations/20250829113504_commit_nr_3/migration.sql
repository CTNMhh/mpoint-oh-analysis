/*
  Warnings:

  - You are about to drop the column `companyId` on the `MarketplaceEntry` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MarketplaceEntry" DROP CONSTRAINT "MarketplaceEntry_companyId_fkey";

-- DropIndex
DROP INDEX "MarketplaceEntry_companyId_idx";

-- AlterTable
ALTER TABLE "MarketplaceEntry" DROP COLUMN "companyId";
