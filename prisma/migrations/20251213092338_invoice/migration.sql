-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_kode_unik_fkey";

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Booking"("kode_unik") ON DELETE RESTRICT ON UPDATE CASCADE;
