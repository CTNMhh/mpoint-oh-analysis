/*
  Warnings:

  - The `district` column on the `Company` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `exportQuota` on the `Company` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Made the column `customerType` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `customerCount` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `exportQuota` on table `Company` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "companyDescription" TEXT,
ADD COLUMN     "decisionMakers" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "decisionSpeed" "DecisionSpeed" NOT NULL DEFAULT 'MODERATE',
ADD COLUMN     "growthPhase" "GrowthPhase" NOT NULL DEFAULT 'ESTABLISHED',
ADD COLUMN     "growthRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "leadershipStructure" "LeadershipStructure" NOT NULL DEFAULT 'OWNER_LED',
ADD COLUMN     "marketReach" "MarketReach" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "seasonality" "Seasonality" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "sustainabilityFocus" INTEGER NOT NULL DEFAULT 5,
ALTER COLUMN "employeeCount" SET DEFAULT 1,
ALTER COLUMN "annualRevenue" SET DEFAULT 0,
ALTER COLUMN "employeeRange" SET DEFAULT 'SOLO',
ALTER COLUMN "revenueRange" SET DEFAULT 'MICRO',
DROP COLUMN "district",
ADD COLUMN     "district" "HamburgDistrict",
ALTER COLUMN "customerType" SET NOT NULL,
ALTER COLUMN "customerType" SET DEFAULT 'B2B',
ALTER COLUMN "customerCount" SET NOT NULL,
ALTER COLUMN "customerCount" SET DEFAULT 'VERY_SMALL',
ALTER COLUMN "exportQuota" SET NOT NULL,
ALTER COLUMN "exportQuota" SET DEFAULT 0,
ALTER COLUMN "exportQuota" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE INDEX "Company_district_idx" ON "Company"("district");

-- CreateIndex
CREATE INDEX "Company_customerType_idx" ON "Company"("customerType");

-- CreateIndex
CREATE INDEX "Company_marketReach_idx" ON "Company"("marketReach");

-- CreateIndex
CREATE INDEX "Company_growthPhase_idx" ON "Company"("growthPhase");
