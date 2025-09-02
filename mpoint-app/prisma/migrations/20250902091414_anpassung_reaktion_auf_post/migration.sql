/*
  Warnings:

  - A unique constraint covering the columns `[postId,memberId]` on the table `GroupFeedReaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GroupFeedReaction_postId_memberId_key" ON "GroupFeedReaction"("postId", "memberId");
