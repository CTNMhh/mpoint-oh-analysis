/*
  Warnings:

  - You are about to drop the column `branchDescription` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `primaryNaceCode` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "primaryNaceCode" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "branchDescription",
DROP COLUMN "primaryNaceCode";
