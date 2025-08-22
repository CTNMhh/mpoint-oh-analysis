-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('ALLGEMEIN', 'WIRTSCHAFT', 'TECHNOLOGIE', 'DIGITALISIERUNG', 'NACHHALTIGKEIT', 'EVENTS', 'NETZWERK', 'FOERDERUNG', 'POLITIK');

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "author" TEXT,
    "category" "NewsCategory" NOT NULL DEFAULT 'ALLGEMEIN',
    "tags" TEXT[],
    "publishDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "News_category_idx" ON "News"("category");

-- CreateIndex
CREATE INDEX "News_publishDate_idx" ON "News"("publishDate");

-- CreateIndex
CREATE INDEX "News_isPublished_idx" ON "News"("isPublished");
