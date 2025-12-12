/*
  Warnings:

  - The `status_booking` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'SUCCESS', 'EXPIRED', 'FAILURE');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "status_midtrans" VARCHAR(255),
DROP COLUMN "status_booking",
ADD COLUMN     "status_booking" "BookingStatus" NOT NULL DEFAULT 'PENDING';
