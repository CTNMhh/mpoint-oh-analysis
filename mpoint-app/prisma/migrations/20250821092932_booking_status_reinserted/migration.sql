-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "bookingStatus" "BookingStatus" NOT NULL DEFAULT 'PENDING';
