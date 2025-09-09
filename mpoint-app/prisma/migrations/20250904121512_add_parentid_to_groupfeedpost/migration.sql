-- AlterTable
ALTER TABLE "GroupFeedPost" ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "GroupFeedPost" ADD CONSTRAINT "GroupFeedPost_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "GroupFeedPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
