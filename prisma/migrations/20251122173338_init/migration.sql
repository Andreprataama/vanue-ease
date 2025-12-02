-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "nama_owner" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" SERIAL NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "nama_ruangan" VARCHAR(255) NOT NULL,
    "alamat_venue" TEXT,
    "tipe_sewa" VARCHAR(50),
    "harga_per_jam" DECIMAL(10,2),
    "harga_per_hari" DECIMAL(10,2),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "booking_id" SERIAL NOT NULL,
    "venue_id" INTEGER NOT NULL,
    "kode_unik" VARCHAR(100) NOT NULL,
    "email_pemesan" VARCHAR(255) NOT NULL,
    "telepon_pemesan" VARCHAR(50),
    "tanggal_mulai" DATE NOT NULL,
    "tanggal_akhir" DATE,
    "jam_mulai" TIME(0),
    "jam_akhir" TIME(0),
    "total_harga" DECIMAL(10,2) NOT NULL,
    "status_booking" VARCHAR(50) NOT NULL,
    "is_manual" BOOLEAN NOT NULL DEFAULT false,
    "booked_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes_pemesan" TEXT,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "payment_id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "ref_pembayaran" VARCHAR(255),
    "status_pembayaran" VARCHAR(50),
    "jumlah_bayar" DECIMAL(10,2),
    "tanggal_pembayaran" TIMESTAMP(6),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "BlockedSlot" (
    "block_id" SERIAL NOT NULL,
    "venue_id" INTEGER NOT NULL,
    "tanggal_mulai" DATE NOT NULL,
    "tanggal_akhir" DATE,
    "jam_mulai" TIME(0),
    "jam_akhir" TIME(0),
    "alasan_block" VARCHAR(255),
    "blocked_by_owner_id" INTEGER NOT NULL,

    CONSTRAINT "BlockedSlot_pkey" PRIMARY KEY ("block_id")
);

-- CreateTable
CREATE TABLE "PriceRule" (
    "rule_id" SERIAL NOT NULL,
    "venue_id" INTEGER NOT NULL,
    "tanggal_mulai" DATE NOT NULL,
    "tanggal_akhir" DATE NOT NULL,
    "harga_override_per_jam" DECIMAL(10,2),
    "harga_override_per_hari" DECIMAL(10,2),
    "alasan" VARCHAR(255),
    "created_by_owner_id" INTEGER NOT NULL,

    CONSTRAINT "PriceRule_pkey" PRIMARY KEY ("rule_id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" SERIAL NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "link_to" VARCHAR(255),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "Category" (
    "category_id" SERIAL NOT NULL,
    "nama_kategori" VARCHAR(100) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "VenueCategory" (
    "venue_category_id" SERIAL NOT NULL,
    "venue_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "VenueCategory_pkey" PRIMARY KEY ("venue_category_id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "facility_id" SERIAL NOT NULL,
    "nama_fasilitas" VARCHAR(100) NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("facility_id")
);

-- CreateTable
CREATE TABLE "VenueFacility" (
    "venue_facility_id" SERIAL NOT NULL,
    "venue_id" INTEGER NOT NULL,
    "facility_id" INTEGER NOT NULL,

    CONSTRAINT "VenueFacility_pkey" PRIMARY KEY ("venue_facility_id")
);

-- CreateTable
CREATE TABLE "VenueImage" (
    "image_id" SERIAL NOT NULL,
    "venue_id" INTEGER NOT NULL,
    "image_url" VARCHAR(512) NOT NULL,
    "is_primary" BOOLEAN,
    "sort_order" INTEGER,

    CONSTRAINT "VenueImage_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "Review" (
    "review_id" SERIAL NOT NULL,
    "venue_id" INTEGER NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "nama_reviewer" VARCHAR(255),
    "rating" SMALLINT NOT NULL,
    "komentar" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "BookingHistory" (
    "history_id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "old_status" VARCHAR(50),
    "new_status" VARCHAR(50) NOT NULL,
    "changed_by" VARCHAR(50),
    "changed_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingHistory_pkey" PRIMARY KEY ("history_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Venue_owner_id_idx" ON "Venue"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_kode_unik_key" ON "Booking"("kode_unik");

-- CreateIndex
CREATE INDEX "Booking_venue_id_idx" ON "Booking"("venue_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_booking_id_key" ON "Payment"("booking_id");

-- CreateIndex
CREATE INDEX "BlockedSlot_venue_id_idx" ON "BlockedSlot"("venue_id");

-- CreateIndex
CREATE INDEX "BlockedSlot_blocked_by_owner_id_idx" ON "BlockedSlot"("blocked_by_owner_id");

-- CreateIndex
CREATE INDEX "PriceRule_venue_id_idx" ON "PriceRule"("venue_id");

-- CreateIndex
CREATE INDEX "PriceRule_created_by_owner_id_idx" ON "PriceRule"("created_by_owner_id");

-- CreateIndex
CREATE INDEX "Notification_owner_id_idx" ON "Notification"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "Category_nama_kategori_key" ON "Category"("nama_kategori");

-- CreateIndex
CREATE INDEX "VenueCategory_venue_id_idx" ON "VenueCategory"("venue_id");

-- CreateIndex
CREATE INDEX "VenueCategory_category_id_idx" ON "VenueCategory"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "VenueCategory_venue_id_category_id_key" ON "VenueCategory"("venue_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "Facility_nama_fasilitas_key" ON "Facility"("nama_fasilitas");

-- CreateIndex
CREATE INDEX "VenueFacility_venue_id_idx" ON "VenueFacility"("venue_id");

-- CreateIndex
CREATE INDEX "VenueFacility_facility_id_idx" ON "VenueFacility"("facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "VenueFacility_venue_id_facility_id_key" ON "VenueFacility"("venue_id", "facility_id");

-- CreateIndex
CREATE INDEX "VenueImage_venue_id_idx" ON "VenueImage"("venue_id");

-- CreateIndex
CREATE UNIQUE INDEX "Review_booking_id_key" ON "Review"("booking_id");

-- CreateIndex
CREATE INDEX "Review_venue_id_idx" ON "Review"("venue_id");

-- CreateIndex
CREATE INDEX "BookingHistory_booking_id_idx" ON "BookingHistory"("booking_id");

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedSlot" ADD CONSTRAINT "BlockedSlot_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedSlot" ADD CONSTRAINT "BlockedSlot_blocked_by_owner_id_fkey" FOREIGN KEY ("blocked_by_owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceRule" ADD CONSTRAINT "PriceRule_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceRule" ADD CONSTRAINT "PriceRule_created_by_owner_id_fkey" FOREIGN KEY ("created_by_owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueCategory" ADD CONSTRAINT "VenueCategory_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueCategory" ADD CONSTRAINT "VenueCategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueFacility" ADD CONSTRAINT "VenueFacility_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueFacility" ADD CONSTRAINT "VenueFacility_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "Facility"("facility_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueImage" ADD CONSTRAINT "VenueImage_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingHistory" ADD CONSTRAINT "BookingHistory_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;
