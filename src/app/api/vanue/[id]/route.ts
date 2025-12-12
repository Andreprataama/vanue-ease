import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";

import prisma from "@/utils/prisma";
import { auth } from "@/lib/auth";
import { Prisma } from "@/generated/prisma/client";
import { supabase } from "@/utils/supabase"; // Wajib: Import klien Supabase

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
    fasilitas_kustom: z.string().optional().nullable(),
    selectedFacilities: z.array(z.string()).default([]),
    peraturan_venue: z.string().optional().nullable(),
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const venueId = parseInt(id, 10);

  if (isNaN(venueId) || venueId <= 0) {
    return NextResponse.json(
      { message: "Invalid Venue ID in path." },
      { status: 400 }
    );
  }

  const authCheck = await getOwnerId();

  if ("response" in authCheck) {
    return authCheck.response;
  }
  const ownerId = authCheck.ownerId;

  try {
    const venue = await prisma.venue.findFirst({
      where: {
        id: venueId,
        owner_id: ownerId,
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

        images: {
          select: { image_url: true, is_primary: true, sort_order: true },
          orderBy: { sort_order: "asc" },
        },
        venueCategories: {
          select: { category: { select: { nama_kategori: true } } },
        },
        venueFacilities: {
          select: { facility: { select: { nama_fasilitas: true } } },
        },
      },
    });

    if (!venue) {
      return NextResponse.json(
        { message: "Venue not found or unauthorized to view." },
        { status: 404 }
      );
    }

    const serializedVenue = {
      ...venue,
      harga_per_jam: venue.harga_per_jam
        ? Number(venue.harga_per_jam.toString())
        : null,
      harga_per_hari: venue.harga_per_hari
        ? Number(venue.harga_per_hari.toString())
        : null,

      selectedFacilities: venue.venueFacilities.map(
        (vf) => vf.facility.nama_fasilitas
      ),
      category: venue.venueCategories[0]?.category.nama_kategori || "",
    };

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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const venueId = parseInt(id, 10);

  if (isNaN(venueId) || venueId <= 0) {
    return NextResponse.json(
      { message: "Invalid Venue ID in path." },
      { status: 400 }
    );
  }

  const authCheck = await getOwnerId();
  if ("response" in authCheck) {
    return authCheck.response;
  }
  const ownerId = authCheck.ownerId;

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
        where: { id: venueId, owner_id: ownerId },
      }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting venue:", error);
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
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await getOwnerId();
  if ("response" in authCheck) return authCheck.response;
  const ownerId = authCheck.ownerId;

  const { id } = await params;
  const venueId = parseInt(id, 10);

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
    // MEMBACA FORM DATA (Ini adalah baris yang disorot, dan sudah benar)
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData.entries());
    const selectedFacilities = formData.getAll("selectedFacilities") || [];

    // Persiapan data untuk validasi Zod (menghilangkan file/URL gambar sementara)
    const dataToValidate: any = {
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
    for (let i = 0; i < 5; i++) {
      delete dataToValidate[`image_${i}`];
    }

    // Validasi Data Form
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
      category,
      selectedFacilities: validatedFacilities,
      harga_per_jam,
      tipe_sewa,
      harga_per_hari,
      ...dataToUpdate
    } = validatedData.data;

    // --- 1. IMAGE PROCESSING (Upload to Supabase Storage) ---
    const newImageLinks: {
      image_url: string;
      is_primary: boolean;
      sort_order: number;
    }[] = [];

    const venueNameSlug = dataToUpdate.nama_ruangan
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const bucketName = "venue-images";

    for (let i = 0; i < 5; i++) {
      const key = `image_${i}`;
      const fileEntry = formData.get(key);

      if (fileEntry instanceof File && fileEntry.size > 0) {
        // KASUS 1: File BARU diupload -> Upload to Supabase

        const fileBlob = fileEntry as Blob;
        const filePath = `${ownerId}/${venueNameSlug}/${Date.now()}-${i}-${fileEntry.name.replace(
          /\s/g,
          "_"
        )}`;

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, fileBlob, {
            cacheControl: "3600",
            upsert: true,
            contentType: fileEntry.type,
          });

        if (uploadError) {
          console.error("Supabase Upload Error:", uploadError);
          return NextResponse.json(
            {
              message: "Failed to upload image to storage.",
              error: uploadError.message,
            },
            { status: 500 }
          );
        }

        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        const permanentUrl = publicUrlData.publicUrl;

        newImageLinks.push({
          image_url: permanentUrl,
          is_primary: i === 0,
          sort_order: i,
        });
      } else if (
        typeof fileEntry === "string" &&
        (fileEntry.startsWith("http") ||
          fileEntry.startsWith("/assets/default_venue.jpg"))
      ) {
        // KASUS 2: Old URL retained (Supabase URL or local default URL)
        newImageLinks.push({
          image_url: fileEntry,
          is_primary: i === 0,
          sort_order: i,
        });
      }
    }

    // Fallback: If all images were removed/no new images, use default.
    if (newImageLinks.length === 0) {
      newImageLinks.push({
        image_url: "/assets/default_venue.jpg",
        is_primary: true,
        sort_order: 0,
      });
    }

    // --- 2. Database Transaction for Data and Relationships ---
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
      // a. Delete all old images and create new/retained ones
      await prisma.venueImage.deleteMany({ where: { venue_id: venueId } });

      await prisma.venueImage.createMany({
        data: newImageLinks.map((img) => ({
          venue_id: venueId,
          image_url: img.image_url,
          is_primary: img.is_primary,
          sort_order: img.sort_order,
        })),
      });

      // b. Delete and recreate category and facility relations
      await prisma.venueCategory.deleteMany({ where: { venue_id: venueId } });
      await prisma.venueFacility.deleteMany({ where: { venue_id: venueId } });

      await prisma.venueCategory.create({
        data: { venue_id: venueId, category_id: venueCategory.category_id },
      });

      for (const facilityName of validatedFacilities) {
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

    // --- 3. Update main Venue data ---
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
