import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { kode_unik: orderId },
      select: {
        booking_id: true,
        kode_unik: true,
        email_pemesan: true,
        telepon_pemesan: true,
        tanggal_mulai: true,
        jam_mulai: true,
        total_harga: true,
        status_booking: true,
        status_midtrans: true,
        notes_pemesan: true,
        venue: {
          select: {
            nama_ruangan: true,
            alamat_venue: true,
            tipe_sewa: true,
          },
        },
      },
    });

    if (!booking) {
      console.log(
        `[API Debug] Booking dengan kode ${orderId} tidak ditemukan.`
      );
      return NextResponse.json(
        {
          message: `Booking not found (Kode Unik ${orderId} tidak cocok di database).`,
        },
        { status: 404 }
      );
    }

    const serializedBooking = {
      ...booking,

      total_harga: Number(booking.total_harga.toString()),
      tanggal_mulai: booking.tanggal_mulai.toISOString().split("T")[0],
      jam_mulai: booking.jam_mulai?.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }),
    };

    return NextResponse.json(
      { success: true, data: serializedBooking },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching booking detail:", error);
    return NextResponse.json(
      { message: "Failed to fetch booking details due to a server error." },
      { status: 500 }
    );
  }
}
