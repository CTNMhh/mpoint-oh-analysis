/*
  Warnings:

  - You are about to drop the column `content` on the `News` table. All the data in the column will be lost.
  - Added the required column `longText` to the `News` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortText` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "News" DROP COLUMN "content",
ADD COLUMN     "longText" TEXT NOT NULL,
ADD COLUMN     "shortText" TEXT NOT NULL;
