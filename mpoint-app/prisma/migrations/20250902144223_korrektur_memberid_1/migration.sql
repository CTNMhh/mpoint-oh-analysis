-- DropForeignKey
ALTER TABLE "GroupFeedPost" DROP CONSTRAINT "GroupFeedPost_authorId_fkey";

-- AddForeignKey
ALTER TABLE "GroupFeedPost" ADD CONSTRAINT "GroupFeedPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "GroupMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
