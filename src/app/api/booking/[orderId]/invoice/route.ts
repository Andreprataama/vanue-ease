import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/utils/prisma";
import { promises as fs } from "fs"; // Import untuk operasi file (Server-side only)
import path from "path"; // Import untuk menangani path file (Server-side only)

export async function GET(
  // Menggunakan NextRequest dan menghapus Promise dari params
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params; // Akses params langsung

  if (!orderId) {
    return NextResponse.json(
      { message: "Order ID tidak ditemukan." },
      { status: 400 }
    );
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { kode_unik: orderId },
      select: {
        status_booking: true,
        kode_unik: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking tidak ditemukan." },
        { status: 404 }
      );
    }

    // 2. Validasi Status Pembayaran
    if (booking.status_booking !== "SUCCESS") {
      return NextResponse.json(
        { message: "Faktur hanya tersedia untuk transaksi yang sudah LUNAS." },
        { status: 403 }
      );
    }

    // 3. Tentukan Path File PDF Lokal secara Dinamis
    const fileName = `${booking.kode_unik}.pdf`;
    // ASUMSI: File faktur disimpan di public/invoices/
    const filePath = path.join(process.cwd(), "public", "invoices", fileName);

    // 4. Baca File Data ke dalam Buffer
    const fileBuffer = await fs.readFile(filePath);

    // 5. Konfigurasi Headers untuk Download
    const headers = new Headers();
    // Tipe konten untuk PDF
    headers.set("Content-Type", "application/pdf");
    // Menggunakan attachment untuk memaksa browser mengunduh file
    headers.set("Content-Disposition", `attachment; filename="${fileName}"`);

    // 6. Return File sebagai Binary Response
    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // Error ENOENT = File Not Found (Faktur belum dibuat/hilang)
      return NextResponse.json(
        { message: "Faktur belum tersedia atau tidak ditemukan di server." },
        { status: 404 }
      );
    }

    console.error("Database or File Download Error:", error.message);
    return NextResponse.json(
      { message: "Gagal memproses faktur.", detail: error.message },
      { status: 500 }
    );
  }
}
