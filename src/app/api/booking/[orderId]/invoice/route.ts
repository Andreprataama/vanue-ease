import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  if (!orderId) {
    return NextResponse.json(
      { message: "Order ID tidak ditemukan." },
      { status: 400 }
    );
  }

  try {
    // 1. Ambil Booking dari Database (menggunakan orderId/kode_unik)
    const booking = await prisma.booking.findUnique({
      where: { kode_unik: orderId },
      select: {
        pdf_invoice_url: true,
        status_booking: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking tidak ditemukan." },
        { status: 404 }
      );
    }

    // 2. Validasi Status Pembayaran
    if (
      booking.status_booking !== "SUCCESS" &&
      booking.status_booking !== "FAILURE"
    ) {
      return NextResponse.json(
        { message: "Faktur hanya tersedia untuk transaksi yang sudah LUNAS." },
        { status: 403 }
      );
    }

    // 3. Dapatkan PDF URL dari Database
    const pdfUrl = booking.pdf_invoice_url;

    if (!pdfUrl) {
      throw new Error("PDF URL faktur belum tersedia atau tidak tersimpan.");
    }

    // 4. Redirect ke URL PDF Midtrans
    return NextResponse.redirect(pdfUrl);
  } catch (error: any) {
    console.error("Database Invoice Error:", error.message);
    return NextResponse.json(
      { message: "Gagal mengambil URL faktur.", detail: error.message },
      { status: 500 }
    );
  }
}
