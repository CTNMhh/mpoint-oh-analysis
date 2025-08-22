-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MatchStatus" ADD VALUE 'ACCEPTED';
ALTER TYPE "MatchStatus" ADD VALUE 'DECLINED';
ALTER TYPE "MatchStatus" ADD VALUE 'EXPIRED';
ALTER TYPE "MatchStatus" ADD VALUE 'ARCHIVED';

-- CreateTable
CREATE TABLE "MarketplaceEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "price" JSONB NOT NULL,
    "type" TEXT NOT NULL,
    "email" TEXT,
    "publicEmail" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "deadline" TIMESTAMP(3),
    "skills" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceRequest" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketplaceEntry_category_idx" ON "MarketplaceEntry"("category");

-- CreateIndex
CREATE INDEX "MarketplaceEntry_type_idx" ON "MarketplaceEntry"("type");

-- CreateIndex
CREATE INDEX "MarketplaceEntry_userId_idx" ON "MarketplaceEntry"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceRequest_projectId_userId_key" ON "MarketplaceRequest"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "MarketplaceEntry" ADD CONSTRAINT "MarketplaceEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceRequest" ADD CONSTRAINT "MarketplaceRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "MarketplaceEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceRequest" ADD CONSTRAINT "MarketplaceRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
