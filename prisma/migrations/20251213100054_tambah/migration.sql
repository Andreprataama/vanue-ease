/*
  Warnings:

  - Added the required column `jumlah_tamu` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama_pemesan` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "jumlah_tamu" INTEGER NOT NULL,
ADD COLUMN     "nama_pemesan" VARCHAR NOT NULL;
