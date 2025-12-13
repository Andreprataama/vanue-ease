import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import prisma from "@/utils/prisma";
import { Decimal } from "@prisma/client/runtime/library";

const Snap = midtransClient.Snap;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const clientKey = process.env.MIDTRANS_CLIENT_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!serverKey || !clientKey || !appUrl) {
    return NextResponse.json(
      { message: "Server configuration error: Missing environment keys." },
      { status: 500 }
    );
  }

  try {
    const { orderId } = await params;

    const booking = await prisma.booking.findUnique({
      where: { kode_unik: orderId },
      // SELECT semua field yang dibutuhkan untuk parameter Midtrans
      select: {
        kode_unik: true,
        total_harga: true,
        status_booking: true,
        email_pemesan: true,
        telepon_pemesan: true,
        venue: { select: { nama_ruangan: true, tipe_sewa: true } },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 }
      );
    }
    if (booking.status_booking !== "PENDING") {
      return NextResponse.json(
        { message: `Cannot repay. Current status: ${booking.status_booking}.` },
        { status: 403 }
      );
    }

    // --- Logika perhitungan harga ---
    const finalGrossAmountForMidtrans = Math.round(Number(booking.total_harga));
    const serviceFee = 10000;
    const hargaDasar = finalGrossAmountForMidtrans - serviceFee;
    const assumedFirstName = booking.email_pemesan.split("@")[0] || "Guest";

    const snap = new Snap({
      isProduction: process.env.NODE_ENV === "production",
      serverKey: serverKey!,
      clientKey: clientKey!,
    });

    // Parameter Transaksi
    const parameter = {
      transaction_details: {
        order_id: booking.kode_unik,
        gross_amount: finalGrossAmountForMidtrans,
      },
      customer_details: {
        first_name: assumedFirstName,
        email: booking.email_pemesan,
        phone: booking.telepon_pemesan,
      },
      item_details: [
        {
          id: booking.kode_unik + "-BASE",
          price: hargaDasar,
          quantity: 1,
          name: `${booking.venue.nama_ruangan}`,
        },
        {
          id: "SERVICE-FEE",
          price: serviceFee,
          quantity: 1,
          name: "Biaya Layanan",
        },
      ],
      callbacks: {
        finish: `${appUrl}/Pembayaran/success?order_id=${booking.kode_unik}`,
        error: `${appUrl}/Pembayaran/failure?order_id=${booking.kode_unik}`,
        unfinish: `${appUrl}/Pembayaran/pending?order_id=${booking.kode_unik}`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    // --- PENYIMPANAN PDF URL KRITIS ---
    // Simpan URL faktur Midtrans ke database Anda.
    const pdfUrl =
      (transaction as any).pdf_url || (transaction as any).redirect_url || "";

    await prisma.booking.update({
      where: { kode_unik: orderId },
      data: {
        pdf_invoice_url: pdfUrl,
      },
    });
    // ---------------------------------

    return NextResponse.json(
      {
        success: true,
        snapToken: transaction.token,
        orderId: booking.kode_unik,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Repay Snap Token Error:", error);
    return NextResponse.json(
      { message: "Failed to generate Snap Token.", detail: error.message },
      { status: 500 }
    );
  }
}
