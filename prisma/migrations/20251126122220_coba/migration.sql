/*
  Warnings:

  - You are about to drop the column `access_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `id_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `providerAccountId` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `session_state` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `token_type` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `expires` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `sessionToken` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `verification_token` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[providerId,accountId]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerId` to the `account` table without a default value. This is not possible if the table is not empty.
  - Made the column `expiresAt` on table `session` required. This step will fail if there are existing NULL values in that column.
  - Made the column `token` on table `session` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "account_provider_providerAccountId_key";

-- DropIndex
DROP INDEX "session_sessionToken_key";

-- AlterTable
ALTER TABLE "BlockedSlot" ALTER COLUMN "alasan_block" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "kode_unik" SET DATA TYPE VARCHAR,
ALTER COLUMN "email_pemesan" SET DATA TYPE VARCHAR,
ALTER COLUMN "telepon_pemesan" SET DATA TYPE VARCHAR,
ALTER COLUMN "status_booking" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "BookingHistory" ALTER COLUMN "old_status" SET DATA TYPE VARCHAR,
ALTER COLUMN "new_status" SET DATA TYPE VARCHAR,
ALTER COLUMN "changed_by" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "nama_kategori" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "Facility" ALTER COLUMN "nama_fasilitas" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "link_to" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "ref_pembayaran" SET DATA TYPE VARCHAR,
ALTER COLUMN "status_pembayaran" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "PriceRule" ALTER COLUMN "alasan" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "nama_reviewer" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "Venue" ALTER COLUMN "nama_ruangan" SET DATA TYPE VARCHAR,
ALTER COLUMN "tipe_sewa" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "VenueImage" ALTER COLUMN "image_url" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "account" DROP COLUMN "access_token",
DROP COLUMN "expires_at",
DROP COLUMN "id_token",
DROP COLUMN "provider",
DROP COLUMN "providerAccountId",
DROP COLUMN "refresh_token",
DROP COLUMN "session_state",
DROP COLUMN "token_type",
DROP COLUMN "type",
ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "accessTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "idToken" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "providerId" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT;

-- AlterTable
ALTER TABLE "payout_detail" ALTER COLUMN "bank_name" SET DATA TYPE VARCHAR,
ALTER COLUMN "account_number" SET DATA TYPE VARCHAR,
ALTER COLUMN "account_holder_name" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "session" DROP COLUMN "expires",
DROP COLUMN "sessionToken",
ALTER COLUMN "expiresAt" SET NOT NULL,
ALTER COLUMN "token" SET NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "created_at",
DROP COLUMN "password",
ADD COLUMN     "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "email" SET DATA TYPE VARCHAR,
ALTER COLUMN "name" SET DATA TYPE VARCHAR,
ALTER COLUMN "contact_number" SET DATA TYPE VARCHAR;

-- DropTable
DROP TABLE "verification_token";

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");
