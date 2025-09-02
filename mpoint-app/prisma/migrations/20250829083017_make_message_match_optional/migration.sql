-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_matchId_fkey";

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "matchId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Message_senderUserId_receiverUserId_createdAt_idx" ON "Message"("senderUserId", "receiverUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_receiverUserId_senderUserId_createdAt_idx" ON "Message"("receiverUserId", "senderUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverUserId_fkey" FOREIGN KEY ("receiverUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
