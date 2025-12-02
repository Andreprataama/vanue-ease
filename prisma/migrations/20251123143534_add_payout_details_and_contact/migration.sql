-- AlterTable
ALTER TABLE "user" ADD COLUMN     "contact_number" VARCHAR(50);

-- CreateTable
CREATE TABLE "payout_detail" (
    "id" SERIAL NOT NULL,
    "partner_user_id" TEXT NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,
    "account_number" VARCHAR(50) NOT NULL,
    "account_holder_name" VARCHAR(255) NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "payout_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payout_detail_partner_user_id_key" ON "payout_detail"("partner_user_id");

-- AddForeignKey
ALTER TABLE "payout_detail" ADD CONSTRAINT "payout_detail_partner_user_id_fkey" FOREIGN KEY ("partner_user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
