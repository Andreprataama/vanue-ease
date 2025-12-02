import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function GET() {
  try {
    // Mengambil semua Venue dengan hanya field yang diperlukan untuk tampilan utama.
    const venues = await prisma.venue.findMany({
      select: {
        id: true,
        nama_ruangan: true,
        tipe_sewa: true,
        harga_per_jam: true,
        harga_per_hari: true,
        kapasitas_maks: true,
        // Ambil gambar yang ditandai sebagai primary (utama)
        images: {
          where: { is_primary: true },
          select: { image_url: true },
        },
        // Ambil kategori pertama
        venueCategories: {
          select: { category: { select: { nama_kategori: true } } },
          take: 1, // Ambil hanya satu kategori jika ada banyak
        },
      },
      // Anda bisa menambahkan orderBy jika diperlukan (misalnya: terbaru dulu)
      // orderBy: {
      //   id: 'desc',
      // }
    });

    // Logging jumlah data yang berhasil diambil (hanya untuk debugging)
    console.log(`Successfully fetched ${venues.length} public venues.`);

    return NextResponse.json({ success: true, data: venues }, { status: 200 });
  } catch (error) {
    console.error("Error fetching public venues:", error);
    return NextResponse.json(
      { message: "Failed to fetch public venues due to a server error." },
      { status: 500 }
    );
  }
}
