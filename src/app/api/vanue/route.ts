import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";

import prisma from "@/utils/prisma";
import { auth } from "@/lib/auth";
import { Prisma } from "@/generated/prisma/client";
import { supabase } from "@/utils/supabase"; // Klien Supabase

const formSchema = z
  .object({
    nama_ruangan: z.string().min(1, "Nama Vanue wajib diisi."),
    deskripsi_venue: z.string().min(1, "Deskripsi wajib diisi."),
    alamat_venue: z
      .string()
      .min(1, "Alamat Google Maps wajib diisi.")
      .or(z.string().url("Alamat harus berupa link yang valid.")),
    kapasitas_maks: z.coerce
      .number()
      .min(1)
      .max(10000, "Kapasitas maksimal 10,000"),
    category: z.string().min(1, "Kategori wajib dipilih."),
    tipe_sewa: z.enum(["perhari", "perjam"]),
    harga_per_jam: z.coerce.number().optional().nullable().default(null),
    harga_per_hari: z.coerce.number().optional().nullable().default(null),
    fasilitas_kustom: z.string().optional(),
    selectedFacilities: z.array(z.string()).default([]),
    peraturan_venue: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.tipe_sewa === "perjam" &&
      (!data.harga_per_jam || data.harga_per_jam <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["harga_per_jam"],
        message: "Harga per Jam wajib diisi dan harus lebih dari 0.",
      });
    }
    if (
      data.tipe_sewa === "perhari" &&
      (!data.harga_per_hari || data.harga_per_hari <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["harga_per_hari"],
        message: "Harga per Hari wajib diisi dan harus lebih dari 0.",
      });
    }
  });

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

export async function GET() {
  const authCheck = await getOwnerId();

  if ("response" in authCheck) {
    return authCheck.response;
  }
  const ownerId = authCheck.ownerId;

  try {
    const venues = await prisma.venue.findMany({
      where: {
        owner_id: ownerId,
      },
      select: {
        id: true,
        nama_ruangan: true,
        tipe_sewa: true,
        harga_per_jam: true,
        harga_per_hari: true,
        kapasitas_maks: true,
        is_published: true,
        images: {
          where: { is_primary: true },
          select: { image_url: true },
        },
        venueCategories: {
          select: { category: { select: { nama_kategori: true } } },
        },
      },
    });

    const serializedVenues = venues.map((venue) => ({
      ...venue,
      harga_per_jam: venue.harga_per_jam?.toString() ?? null,
      harga_per_hari: venue.harga_per_hari?.toString() ?? null,
    }));

    return NextResponse.json(
      { success: true, data: serializedVenues },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching venues:", error);
    return NextResponse.json(
      { message: "Failed to fetch venues due to a server error." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authCheck = await getOwnerId();

  if ("response" in authCheck) {
    return authCheck.response;
  }
  const ownerId = authCheck.ownerId;

  try {
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData.entries());
    const selectedFacilities = formData.getAll("selectedFacilities") || [];

    const dataToValidate = {
      ...rawData,
      selectedFacilities: selectedFacilities,
      harga_per_jam:
        rawData.harga_per_jam === "null" || rawData.harga_per_jam === ""
          ? null
          : rawData.harga_per_jam,
      harga_per_hari:
        rawData.harga_per_hari === "null" || rawData.harga_per_hari === ""
          ? null
          : rawData.harga_per_hari,
    };

    const validatedData = formSchema.safeParse(dataToValidate);

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
      nama_ruangan,
      deskripsi_venue,
      alamat_venue,
      kapasitas_maks,
      category,
      tipe_sewa,
      harga_per_jam,
      harga_per_hari,
      fasilitas_kustom,
      peraturan_venue,
    } = validatedData.data;

    // --- Pemrosesan File Gambar (Integrasi Supabase Storage) ---
    const imageLinks: {
      image_url: string;
      is_primary: boolean;
      sort_order: number;
    }[] = [];

    const venueNameSlug = nama_ruangan
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const bucketName = "venue-images";

    for (let i = 0; i < 5; i++) {
      const key = `image_${i}`;
      const fileEntry = formData.get(key);

      if (fileEntry instanceof File && fileEntry.size > 0) {
        // --- LOGIKA UPLOAD SUPABASE ---
        const fileBlob = fileEntry as Blob;
        const filePath = `${ownerId}/${venueNameSlug}/${Date.now()}-${i}-${fileEntry.name.replace(
          /\s/g,
          "_"
        )}`;

        // 1. UPLOAD FILE
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, fileBlob, {
            cacheControl: "3600",
            upsert: true,
            contentType: fileEntry.type,
          });

        if (uploadError) {
          console.error("Supabase Upload Error:", uploadError);
          throw new Error("Gagal mengunggah gambar ke penyimpanan.");
        }

        // 2. Dapatkan URL publik permanen
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        const permanentUrl = publicUrlData.publicUrl;
        // --- AKHIR LOGIKA UPLOAD SUPABASE ---

        imageLinks.push({
          image_url: permanentUrl,
          is_primary: i === 0,
          sort_order: i,
        });
      }
    }

    if (imageLinks.length === 0) {
      imageLinks.push({
        image_url: "/assets/default_venue.jpg",
        is_primary: true,
        sort_order: 0,
      });
    }

    // --- Konversi Harga ke Prisma.Decimal ---
    const finalHargaPerJam =
      harga_per_jam && tipe_sewa === "perjam" && harga_per_jam > 0
        ? new Prisma.Decimal(harga_per_jam)
        : null;
    const finalHargaPerHari =
      harga_per_hari && tipe_sewa === "perhari" && harga_per_hari > 0
        ? new Prisma.Decimal(harga_per_hari)
        : null;

    // --- Kelola Kategori (Upsert) ---
    const venueCategory = await prisma.category.upsert({
      where: { nama_kategori: category },
      update: {},
      create: { nama_kategori: category },
    });

    // --- Kelola Fasilitas (Upsert) ---
    const facilityConnects = [];
    for (const facilityName of validatedData.data.selectedFacilities) {
      const facility = await prisma.facility.upsert({
        where: { nama_fasilitas: String(facilityName) },
        update: {},
        create: { nama_fasilitas: String(facilityName) },
      });
      facilityConnects.push({ facility_id: facility.facility_id });
    }

    // 3. Buat entri Venue baru di database
    const newVenue = await prisma.venue.create({
      data: {
        owner_id: ownerId,
        nama_ruangan,
        deskripsi_venue,
        alamat_venue,
        kapasitas_maks,
        tipe_sewa,
        harga_per_jam: finalHargaPerJam,
        harga_per_hari: finalHargaPerHari,
        peraturan_venue,
        fasilitas_kustom,

        venueCategories: {
          create: [{ category_id: venueCategory.category_id }],
        },
        venueFacilities: {
          create: facilityConnects,
        },
        images: {
          createMany: {
            data: imageLinks,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Venue '${newVenue.nama_ruangan}' berhasil ditambahkan.`,
        venue: newVenue,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating venue:", error);
    if (error && typeof error === "object" && "code" in error) {
      console.error(
        "Prisma error code:",
        (error as any).code,
        "Meta:",
        (error as any).meta
      );
    }
    return NextResponse.json(
      { message: "Failed to add venue due to a server error." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const authCheck = await getOwnerId();
  if ("response" in authCheck) {
    return authCheck.response;
  }
  const ownerId = authCheck.ownerId;
  // -----------------------------

  // 1. Ambil ID Venue dari Query Parameter
  const { searchParams } = new URL(request.url);
  const venueId = parseInt(searchParams.get("id") || "0", 10);

  if (!venueId) {
    return NextResponse.json(
      { message: "Venue ID is missing or invalid." },
      { status: 400 }
    );
  }

  // 2. Cek kepemilikan
  const existingVenue = await prisma.venue.findFirst({
    where: { id: venueId, owner_id: ownerId },
  });

  if (!existingVenue) {
    return NextResponse.json(
      { message: "Venue not found or unauthorized to edit." },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();

    const validatedData = formSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          message: "Invalid input data for update.",
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

    // --- Konversi Harga ke Prisma.Decimal ---
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

    // Perbaikan: Gunakan callback form untuk $transaction agar menangani async operations dengan benar
    await prisma.$transaction(async (prisma) => {
      // 1. Hapus kategori dan fasilitas lama
      await prisma.venueCategory.deleteMany({ where: { venue_id: venueId } });
      await prisma.venueFacility.deleteMany({ where: { venue_id: venueId } });

      // 2. Buat kategori baru
      await prisma.venueCategory.create({
        data: { venue_id: venueId, category_id: venueCategory.category_id },
      });

      // 3. Handle fasilitas: Upsert facility, lalu create venueFacility
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

export async function DELETE(request: NextRequest) {
  const authCheck = await getOwnerId();
  if ("response" in authCheck) {
    return authCheck.response;
  }
  const ownerId = authCheck.ownerId;
  // -----------------------------

  // 1. Ambil ID Venue dari Query Parameter
  const { searchParams } = new URL(request.url);
  const venueId = parseInt(searchParams.get("id") || "0", 10);

  if (!venueId) {
    return NextResponse.json(
      { message: "Venue ID is missing or invalid." },
      { status: 400 }
    );
  }

  try {
    const existingVenue = await prisma.venue.findFirst({
      where: { id: venueId, owner_id: ownerId },
    });

    if (!existingVenue) {
      return NextResponse.json(
        { message: "Venue not found or unauthorized to delete." },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.venueFacility.deleteMany({ where: { venue_id: venueId } }),
      prisma.venueCategory.deleteMany({ where: { venue_id: venueId } }),
      prisma.venueImage.deleteMany({ where: { venue_id: venueId } }),
      prisma.venue.delete({
        where: { id: venueId },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: `Venue (ID: ${venueId}) berhasil dihapus.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting venue:", error);
    return NextResponse.json(
      {
        message:
          "Failed to delete venue. Check related records (e.g., Bookings).",
      },
      { status: 500 }
    );
  }
}
