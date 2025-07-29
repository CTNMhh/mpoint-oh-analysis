-- CreateEnum
CREATE TYPE "EventActionType" AS ENUM ('EVENT_VIEWED', 'EVENT_LIST_VIEWED', 'EVENT_SEARCHED', 'EVENT_FILTERED', 'BOOKING_STARTED', 'BOOKING_COMPLETED', 'BOOKING_CANCELLED', 'BOOKING_MODIFIED', 'EVENT_ATTENDED', 'EVENT_NO_SHOW', 'EVENT_CHECKED_IN', 'EVENT_SHARED', 'EVENT_FAVORITED', 'EVENT_UNFAVORITED', 'EVENT_RATED', 'EVENT_COMMENTED', 'CALENDAR_EXPORT', 'REMINDER_SET', 'EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_PUBLISHED', 'EVENT_UNPUBLISHED', 'EVENT_CANCELLED', 'EVENT_POSTPONED', 'EVENT_COMPLETED', 'EVENT_ARCHIVED', 'EVENT_DELETED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'FULL', 'CANCELLED', 'POSTPONED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "UserBookingStatus" AS ENUM ('INTERESTED', 'BOOKED', 'CONFIRMED', 'CANCELLED', 'ATTENDED', 'NO_SHOW', 'WAITLISTED', 'CHECKED_IN');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "EventActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT,
    "action" "EventActionType" NOT NULL,
    "description" TEXT,
    "spaces" INTEGER,
    "totalCost" DOUBLE PRECISION,
    "bookingId" TEXT,
    "eventStatusBefore" "EventStatus",
    "eventStatusAfter" "EventStatus",
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceType" "DeviceType",
    "sessionId" TEXT,
    "metadata" JSONB,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventActivityLog_userId_idx" ON "EventActivityLog"("userId");

-- CreateIndex
CREATE INDEX "EventActivityLog_eventId_idx" ON "EventActivityLog"("eventId");

-- CreateIndex
CREATE INDEX "EventActivityLog_action_idx" ON "EventActivityLog"("action");

-- CreateIndex
CREATE INDEX "EventActivityLog_timestamp_idx" ON "EventActivityLog"("timestamp");

-- CreateIndex
CREATE INDEX "EventActivityLog_eventStatusAfter_idx" ON "EventActivityLog"("eventStatusAfter");

-- AddForeignKey
ALTER TABLE "EventActivityLog" ADD CONSTRAINT "EventActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventActivityLog" ADD CONSTRAINT "EventActivityLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventActivityLog" ADD CONSTRAINT "EventActivityLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
