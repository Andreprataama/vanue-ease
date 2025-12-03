import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";

import prisma from "@/utils/prisma";
import { auth } from "@/lib/auth";
import { Prisma } from "@/generated/prisma/client";

async function getOwnerId(): Promise<
  { ownerId: string } | { response: NextResponse }
> {
  const headersObj = await headers();
  const session = await auth.api.getSession({ headers: headersObj });

  if (!session || !session.user || !session.user.id) {
    return {
      response: NextResponse.json(
        { message: "Unauthorized. Authentication required." },
        { status: 401 }
      ),
    };
  }
  return { ownerId: session.user.id };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // Menerima params yang berisi ID
) {
  const { id } = await params; // Tambahkan ini!
  const venueId = parseInt(id, 10);
  // 2. VALIDASI ID
  if (isNaN(venueId) || venueId <= 0) {
    return NextResponse.json(
      { message: "Invalid Venue ID in path." },
      { status: 400 }
    );
  }

  // 3. AUTENTIKASI (Panggil fungsi dinamis setelah ID didapat)
  const authCheck = await getOwnerId();

  if ("response" in authCheck) {
    return authCheck.response;
  }
  const ownerId = authCheck.ownerId;

  // 4. PENGAMBILAN DATA & OTORISASI (Prisma)
  try {
    const venue = await prisma.venue.findFirst({
      where: {
        id: venueId,
        owner_id: ownerId, // KLAUSA OTORISASI Wajib
      },
      select: {
        id: true,
        nama_ruangan: true,
        deskripsi_venue: true,
        alamat_venue: true,
        kapasitas_maks: true,
        tipe_sewa: true,
        harga_per_jam: true,
        harga_per_hari: true,
        peraturan_venue: true,
        fasilitas_kustom: true,
        is_published: true,

        // Mengambil Relasi
        images: {
          select: { image_url: true, is_primary: true },
        },
        venueCategories: {
          select: { category: { select: { nama_kategori: true } } },
        },
        venueFacilities: {
          select: { facility: { select: { nama_fasilitas: true } } },
        },
      },
    });

    // 5. CEK KEBERADAAN DATA
    if (!venue) {
      return NextResponse.json(
        { message: "Venue not found or unauthorized to view." },
        { status: 404 }
      );
    }

    // 6. SERIALISASI DATA (Menangani Tipe Decimal)
    const serializedVenue = {
      ...venue,
      harga_per_jam: venue.harga_per_jam?.toString() ?? null,
      harga_per_hari: venue.harga_per_hari?.toString() ?? null,

      selectedFacilities: venue.venueFacilities.map(
        (vf) => vf.facility.nama_fasilitas
      ),
      category: venue.venueCategories[0]?.category.nama_kategori || "",
    };

    // 7. RESPON SUKSES
    return NextResponse.json(
      { success: true, data: serializedVenue },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching single venue:", error);
    return NextResponse.json(
      { message: "Failed to fetch venue due to a server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } } // Menerima params dari URL
) {
  const { id } = await params;
  // 1. Ambil ID dari params
  const venueId = parseInt(id, 10); // Pastikan menggunakan basis 10

  // 2. Validasi ID
  if (isNaN(venueId) || venueId <= 0) {
    return NextResponse.json(
      { message: "Invalid Venue ID in path." },
      { status: 400 }
    );
  }

  // 3. Autentikasi dan Otorisasi User
  const authCheck = await getOwnerId();
  if ("response" in authCheck) {
    return authCheck.response; // Mengembalikan 401 Unauthorized jika sesi tidak valid
  }
  const ownerId = authCheck.ownerId;

  try {
    // A. Cek Kepemilikan
    const existingVenue = await prisma.venue.findFirst({
      where: { id: venueId, owner_id: ownerId }, // Filter berdasarkan ID dan Owner ID
    });

    if (!existingVenue) {
      // Jika venue tidak ditemukan ATAU tidak dimiliki oleh user, kembalikan 404
      return NextResponse.json(
        { message: "Venue not found or unauthorized to delete." },
        { status: 404 }
      );
    }

    // B. Lakukan Penghapusan Transaksional
    // Penting: Hapus semua relasi (Foreign Key) terlebih dahulu sebelum menghapus data utama (Venue)
    await prisma.$transaction([
      prisma.venueFacility.deleteMany({ where: { venue_id: venueId } }),
      prisma.venueCategory.deleteMany({ where: { venue_id: venueId } }),
      prisma.venueImage.deleteMany({ where: { venue_id: venueId } }),
      // Hapus Venue utama (dipastikan milik owner yang benar)
      prisma.venue.delete({
        where: { id: venueId, owner_id: ownerId },
      }),
    ]);

    // C. Respon Sukses
    // Status 204 No Content adalah respons standar HTTP untuk DELETE yang sukses
    // dan tidak mengembalikan konten apapun.
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting venue:", error);
    // Jika terjadi error server (misalnya, ada relasi lain seperti Booking
    // yang tidak terhapus), kembalikan 500.
    return NextResponse.json(
      {
        message:
          "Failed to delete venue due to a server error or dependency issues.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await getOwnerId();
  if ("response" in authCheck) return authCheck.response;
  const ownerId = authCheck.ownerId;
  const venueId = parseInt(params.id, 10);

  if (isNaN(venueId) || venueId <= 0)
    return NextResponse.json({ message: "Invalid Venue ID." }, { status: 400 });

  const existingVenue = await prisma.venue.findFirst({
    where: { id: venueId, owner_id: ownerId },
  });
  if (!existingVenue)
    return NextResponse.json(
      { message: "Venue not found or unauthorized to edit." },
      { status: 404 }
    );

  try {
    const body = await request.json();
    const validatedData = formSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          message: "Invalid input data.",
          errors: validatedData.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      category,
      selectedFacilities,
      harga_per_jam,
      tipe_sewa,
      harga_per_hari,
      ...dataToUpdate
    } = validatedData.data;

    // Konversi Decimal
    const finalHargaPerJam =
      harga_per_jam && tipe_sewa === "perjam" && harga_per_jam > 0
        ? new Prisma.Decimal(harga_per_jam)
        : null;
    const finalHargaPerHari =
      harga_per_hari && tipe_sewa === "perhari" && harga_per_hari > 0
        ? new Prisma.Decimal(harga_per_hari)
        : null;

    const venueCategory = await prisma.category.upsert({
      where: { nama_kategori: category },
      update: {},
      create: { nama_kategori: category },
    });

    await prisma.$transaction(async (prisma) => {
      // Hapus relasi lama
      await prisma.venueCategory.deleteMany({ where: { venue_id: venueId } });
      await prisma.venueFacility.deleteMany({ where: { venue_id: venueId } });

      // Buat relasi baru
      await prisma.venueCategory.create({
        data: { venue_id: venueId, category_id: venueCategory.category_id },
      });
      for (const facilityName of selectedFacilities) {
        const facility = await prisma.facility.upsert({
          where: { nama_fasilitas: String(facilityName) },
          update: {},
          create: { nama_fasilitas: String(facilityName) },
        });
        await prisma.venueFacility.create({
          data: { venue_id: venueId, facility_id: facility.facility_id },
        });
      }
    });

    const updatedVenue = await prisma.venue.update({
      where: { id: venueId, owner_id: ownerId },
      data: {
        ...dataToUpdate,
        harga_per_jam: finalHargaPerJam,
        harga_per_hari: finalHargaPerHari,
        tipe_sewa: tipe_sewa,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Venue '${updatedVenue.nama_ruangan}' berhasil diperbarui.`,
        venue: updatedVenue,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating venue:", error);
    return NextResponse.json(
      { message: "Failed to update venue due to a server error." },
      { status: 500 }
    );
  }
}
