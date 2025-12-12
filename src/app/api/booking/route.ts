import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import midtransClient from "midtrans-client";

import prisma from "@/utils/prisma";
import { Prisma } from "@/generated/prisma/client";

// Skema Validasi Data Booking (Zod)
const bookingSchema = z.object({
  venueId: z.number().int().positive(),
  tanggal_mulai: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  jam_mulai: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)"),
  durasi: z.number().int().optional().nullable(),
  jumlah_tamu: z.number().int().min(1),

  // Data Kontak
  nama_pemesan: z.string().min(1, "Nama pemesan wajib diisi."),
  email_pemesan: z.string().email("Format email pemesan tidak valid."),
  telepon_pemesan: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit.")
    .max(15, "Nomor telepon maksimal 15 digit."),

  // New Fields
  notes_pemesan: z.string().optional().nullable(),
  // Service fee di-default ke 10000 jika tidak disediakan
  service_fee: z.number().int().nonnegative().optional().default(10000),
});

export async function POST(request: Request) {
  // Tidak ada pengecekan auth/session (sesuai permintaan)
  try {
    const rawData = await request.json();

    // 1. Data Validation and Parsing
    const validatedData = bookingSchema.safeParse({
      ...rawData,
      venueId: parseInt(rawData.venueId, 10),
      durasi: rawData.durasi !== null ? parseInt(rawData.durasi, 10) : null,
      jumlah_tamu: parseInt(rawData.jumlah_tamu, 10),
      // Menggunakan default 10000 jika tidak disediakan atau null
      service_fee: parseInt(rawData.service_fee || 10000, 10),
    });

    if (!validatedData.success) {
      return NextResponse.json(
        {
          message: "Invalid booking data.",
          errors: validatedData.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      venueId,
      tanggal_mulai,
      jam_mulai,
      durasi,
      jumlah_tamu,
      nama_pemesan,
      email_pemesan,
      telepon_pemesan,
      notes_pemesan,
      service_fee,
    } = validatedData.data;

    // 2. Ambil detail Venue untuk menghitung harga
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      select: {
        nama_ruangan: true,
        tipe_sewa: true,
        harga_per_jam: true,
        harga_per_hari: true,
        // Pastikan Anda memilih field harga sebagai Decimal jika di Prisma demikian
        // Dalam contoh ini kita asumsikan Number/Decimal bisa dikonversi ke Number
      },
    });

    if (!venue) {
      return NextResponse.json(
        { message: "Venue not found." },
        { status: 404 }
      );
    }

    // 3. Kalkulasi Harga Dasar (Base Price)
    let hargaDasar: number;
    let unitDesc: string;

    if (venue.tipe_sewa === "perjam" && venue.harga_per_jam && durasi) {
      // Pastikan konversi ke Number, karena harga_per_jam dari DB bisa berupa Decimal
      hargaDasar = Number(venue.harga_per_jam) * durasi;
      unitDesc = `(${durasi} Jam)`;
    } else if (venue.tipe_sewa === "perhari" && venue.harga_per_hari) {
      hargaDasar = Number(venue.harga_per_hari);
      unitDesc = "(Per Hari)";
    } else {
      return NextResponse.json(
        {
          message:
            "Pricing data is incomplete or missing duration for 'perjam' booking.",
        },
        { status: 400 }
      );
    }

    const finalGrossAmountForMidtrans = hargaDasar + service_fee;

    const orderId = `VUE-${nanoid(10)}`;
    const booking = await prisma.booking.create({
      data: {
        venue_id: venueId,
        kode_unik: orderId,
        email_pemesan: email_pemesan,
        telepon_pemesan: telepon_pemesan,

        tanggal_mulai: new Date(tanggal_mulai),

        jam_mulai: new Date(`1970-01-01T${jam_mulai}:00.000Z`),

        // Simpan total harga (termasuk service fee) menggunakan Decimal
        total_harga: new Prisma.Decimal(finalGrossAmountForMidtrans),
        // BEST PRACTICE: Status awal selalu PENDING (menggunakan Enum)
        status_booking: "PENDING",

        notes_pemesan:
          notes_pemesan ||
          `Booking oleh ${nama_pemesan} - Tamu: ${jumlah_tamu}`,
        // Jika model Anda memiliki nama_pemesan, tambahkan di sini
        // nama_pemesan: nama_pemesan,
      },
      // Pilih booking_id untuk dikembalikan ke klien
      select: { booking_id: true, kode_unik: true },
    });

    // 5. Buat Snap Transaction (pastikan env tersedia)
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;

    if (!serverKey || !clientKey) {
      throw new Error(
        "MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY wajib di-set"
      );
    }

    const snap = new midtransClient.Snap({
      isProduction: false, // Ganti ke true jika di Production
      serverKey,
      clientKey,
    });

    // Item details untuk Midtrans Snap (terdiri dari 2 item)
    const itemDetails = [
      // Item 1: Harga Dasar
      {
        id: venueId.toString(),
        price: hargaDasar,
        quantity: 1,
        name: `${venue.nama_ruangan} ${unitDesc}`,
      },
      // Item 2: Biaya Layanan
      {
        id: "SERVICE-FEE",
        price: service_fee,
        quantity: 1,
        name: "Biaya Layanan",
      },
    ];

    const parameter = {
      transaction_details: {
        order_id: booking.kode_unik,
        gross_amount: finalGrossAmountForMidtrans, // Kirim TOTAL harga
      },
      credit_card: { secure: true },
      customer_details: {
        first_name: nama_pemesan,
        email: email_pemesan,
        phone: telepon_pemesan,
      },
      item_details: itemDetails,
    };

    const transaction = await snap.createTransaction(parameter);

    // 6. Return Snap Token ke Client
    return NextResponse.json(
      {
        success: true,
        message: "Booking created. Redirecting to payment.",
        snapToken: transaction.token,
        bookingId: booking.booking_id,
        orderId: booking.kode_unik,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { message: "Failed to create booking due to a server error." },
      { status: 500 }
    );
  }
}
