import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import prisma from "@/utils/prisma";

// Pastikan tipe ini sesuai dengan Enum BookingStatus di schema.prisma Anda
type BookingStatus = "PENDING" | "SUCCESS" | "EXPIRED" | "FAILURE";

export async function POST(request: Request) {
  let orderId: string | null = null;

  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;
    if (!serverKey || !clientKey) {
      throw new Error(
        "MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY wajib di-set untuk memproses webhook"
      );
    }

    // Inisialisasi Core API di dalam handler agar memakai env yang telah divalidasi
    const coreApi = new midtransClient.CoreApi({
      isProduction: process.env.NODE_ENV === "production",
      serverKey,
      clientKey,
    });

    const body = await request.json();
    const notification = body;
    const statusResponse = await (
      coreApi as unknown as {
        transaction: {
          notification: (n: unknown) => Promise<{
            order_id: string;
            transaction_status: string;
            fraud_status?: string;
          }>;
        };
      }
    ).transaction.notification(notification);

    orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let newBookingStatus: BookingStatus;

    // 2. Tentukan status booking (menggunakan nilai ENUM)
    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      // Pembayaran berhasil (Kartu kredit (capture) atau Non-kartu kredit (settlement))
      if (fraudStatus === "accept") {
        newBookingStatus = "SUCCESS";
      } else {
        newBookingStatus = "FAILURE"; // Transaksi diblokir (misalnya, suspected fraud)
      }
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "expire" ||
      transactionStatus === "deny"
    ) {
      // Transaksi dibatalkan, kedaluwarsa, atau ditolak
      newBookingStatus = "EXPIRED";
    } else {
      // Status lain (seperti pending, refund, dll.). Kita hanya fokus pada perubahan status.
      newBookingStatus = "PENDING";
    }

    // 3. Update Status Booking di Database
    // Kita hanya melakukan update jika statusnya berubah dari PENDING
    if (orderId && newBookingStatus !== "PENDING") {
      // Pastikan field total_harga tidak di-update karena sudah benar sejak awal
      await prisma.booking.update({
        where: { kode_unik: orderId },
        data: {
          status_booking: newBookingStatus,
        },
      });
      console.log(
        `[Midtrans Webhook] Order ID: ${orderId} updated to ${newBookingStatus}`
      );
    } else {
      // Opsional: Log jika menerima notifikasi PENDING (misalnya, jika status belum berubah)
      console.log(`[Midtrans Webhook] Order ID: ${orderId} is still PENDING.`);
    }
  } catch (error) {
    // Logging error jika ada masalah dalam pemrosesan notifikasi (misalnya, gagal parsing JSON, gagal update DB)
    console.error(
      `[Midtrans Webhook Error] Processing Order ID: ${orderId || "N/A"}:`,
      error
    );

    // BEST PRACTICE: Walaupun terjadi error di sisi server Anda,
    // tetap kembalikan 200 OK agar Midtrans tidak mengulang notifikasi (Retry)
    // jika data di DB sudah terlanjur terupdate.
  }

  // SELALU kembalikan 200 OK ke Midtrans untuk mengkonfirmasi penerimaan notifikasi.
  return NextResponse.json(
    { message: "Notification handled successfully" },
    { status: 200 }
  );
}
