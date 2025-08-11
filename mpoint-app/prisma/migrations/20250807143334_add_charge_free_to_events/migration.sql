-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "chargeFree" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Event_chargeFree_idx" ON "Event"("chargeFree");
