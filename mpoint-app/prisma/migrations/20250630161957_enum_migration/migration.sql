/*
  Warnings:

  - You are about to drop the column `companyDescription` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `customerCount` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `customerType` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `decisionMakers` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `decisionSpeed` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `exportQuota` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `growthPhase` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `growthRate` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `leadershipStructure` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `marketReach` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `seasonality` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `sustainabilityFocus` on the `Company` table. All the data in the column will be lost.
  - The `district` column on the `Company` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `employeeRange` on the `Company` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `revenueRange` on the `Company` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Company_customerType_idx";

-- DropIndex
DROP INDEX "Company_growthPhase_idx";

-- DropIndex
DROP INDEX "Company_marketReach_idx";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "companyDescription",
DROP COLUMN "customerCount",
DROP COLUMN "customerType",
DROP COLUMN "decisionMakers",
DROP COLUMN "decisionSpeed",
DROP COLUMN "exportQuota",
DROP COLUMN "growthPhase",
DROP COLUMN "growthRate",
DROP COLUMN "leadershipStructure",
DROP COLUMN "marketReach",
DROP COLUMN "seasonality",
DROP COLUMN "sustainabilityFocus",
ALTER COLUMN "employeeCount" DROP DEFAULT,
DROP COLUMN "employeeRange",
ADD COLUMN     "employeeRange" TEXT NOT NULL,
ALTER COLUMN "annualRevenue" DROP DEFAULT,
DROP COLUMN "revenueRange",
ADD COLUMN     "revenueRange" TEXT NOT NULL,
DROP COLUMN "district",
ADD COLUMN     "district" TEXT;

-- CreateIndex
CREATE INDEX "Company_district_idx" ON "Company"("district");

-- CreateIndex
CREATE INDEX "Company_employeeRange_idx" ON "Company"("employeeRange");

-- CreateIndex
CREATE INDEX "Company_revenueRange_idx" ON "Company"("revenueRange");

-- 1. Enum-Typen anlegen (nur wenn sie NICHT existieren!)
-- Entferne oder kommentiere diese Zeilen aus:
-- CREATE TYPE "EmployeeRange" AS ENUM ('SOLO', 'MICRO', 'SMALL', 'MEDIUM', 'LARGE');
-- CREATE TYPE "RevenueRange" AS ENUM ('MICRO', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- 2. Spalten-Typen ändern (nur wenn Werte passen!)
ALTER TABLE "Company"
  ALTER COLUMN "employeeRange" TYPE "EmployeeRange" USING "employeeRange"::"EmployeeRange",
  ALTER COLUMN "revenueRange" TYPE "RevenueRange" USING "revenueRange"::"RevenueRange";
