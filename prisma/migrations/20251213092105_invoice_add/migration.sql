-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "pdf_invoice_url" TEXT;

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "items" JSONB NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoice_number_key" ON "Invoice"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_transaction_id_key" ON "Invoice"("transaction_id");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_kode_unik_fkey" FOREIGN KEY ("kode_unik") REFERENCES "Invoice"("transaction_id") ON DELETE RESTRICT ON UPDATE CASCADE;
