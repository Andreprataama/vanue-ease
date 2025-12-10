import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const venueId = parseInt(id, 10);

    if (isNaN(venueId) || venueId <= 0) {
      return NextResponse.json(
        { message: "Invalid Venue ID provided." },
        { status: 400 }
      );
    }

    const venues = await prisma.venue.findFirst({
      where: { id: venueId },
      select: {
        id: true,
        nama_ruangan: true,
        tipe_sewa: true,
        harga_per_jam: true,
        harga_per_hari: true,
        kapasitas_maks: true,
        alamat_venue: true,

        images: {
          select: { image_url: true, sort_order: true, is_primary: true },
          orderBy: { sort_order: "asc" },
        },
        venueFacilities: {
          select: {
            facility: { select: { facility_id: true, nama_fasilitas: true } },
          },
        },
        deskripsi_venue: true,
        venueCategories: {
          select: { category: { select: { nama_kategori: true } } },
          take: 1,
        },
      },
    });

    if (!venues) {
      return NextResponse.json(
        { message: "Venue not found ." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: venues }, { status: 200 });
  } catch (error) {
    console.error("Error fetching public venues:", error);
    return NextResponse.json(
      { message: "Failed to fetch public venues due to a server error." },
      { status: 500 }
    );
  }
}
