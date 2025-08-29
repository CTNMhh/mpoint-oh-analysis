-- AlterTable
ALTER TABLE "MarketplaceEntry" ADD COLUMN     "companyId" TEXT;

-- CreateIndex
CREATE INDEX "MarketplaceEntry_companyId_idx" ON "MarketplaceEntry"("companyId");

-- AddForeignKey
ALTER TABLE "MarketplaceEntry" ADD CONSTRAINT "MarketplaceEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
