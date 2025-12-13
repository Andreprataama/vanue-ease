import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const venues = await prisma.venue.findMany({
      select: {
        id: true,
        nama_ruangan: true,
        tipe_sewa: true,
        harga_per_jam: true,
        harga_per_hari: true,
        kapasitas_maks: true,
        alamat_venue: true,
        images: {
          where: { is_primary: true },
          select: { image_url: true },
        },
        venueFacilities: {
          select: {
            facility: { select: { facility_id: true, nama_fasilitas: true } },
          },
        },
        deskripsi_venue: true,
        venueCategories: {
          select: {
            category: { select: { category_id: true, nama_kategori: true } },
          },
        },
      },
      take: 4,
    });

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
