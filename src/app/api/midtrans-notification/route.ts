import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import prisma from "@/utils/prisma";
import { generateInvoicePdf } from "@/utils/invoice";

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

    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      if (fraudStatus === "accept") {
        newBookingStatus = "SUCCESS";
        if (orderId) {
          try {
            await generateInvoicePdf(orderId);
            console.log(
              `[Midtrans Webhook] Faktur PDF berhasil dibuat dan disimpan untuk Order ID: ${orderId}`
            );
          } catch (pdfError) {
            console.error(
              `[Midtrans Webhook] Gagal membuat PDF untuk Order ID: ${orderId}`,
              pdfError
            );
          }
        }
      } else {
        newBookingStatus = "FAILURE";
      }
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "expire" ||
      transactionStatus === "deny"
    ) {
      newBookingStatus = "EXPIRED";
    } else {
      newBookingStatus = "PENDING";
    }

    if (orderId && newBookingStatus !== "PENDING") {
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
      console.log(`[Midtrans Webhook] Order ID: ${orderId} is still PENDING.`);
    }
  } catch (error) {
    console.error(
      `[Midtrans Webhook Error] Processing Order ID: ${orderId || "N/A"}:`,
      error
    );
  }

  return NextResponse.json(
    { message: "Notification handled successfully" },
    { status: 200 }
  );
}
