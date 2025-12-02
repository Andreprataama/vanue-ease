// src/app/api/owner/venues/route.ts

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";

import prisma from "@/utils/prisma"; //
import { auth } from "@/lib/auth"; //
import { Prisma } from "@/generated/prisma/client";

// --- Zod Schema Server-Side ---
const formSchema = z
  .object({
    nama_ruangan: z.string().min(1, "Nama Vanue wajib diisi."),
    deskripsi_venue: z.string().min(1, "Deskripsi wajib diisi."),
    alamat_venue: z
      .string()
      .url("Alamat harus berupa link yang valid.")
      .or(z.string().min(1, "Alamat Google Maps wajib diisi.")),
    kapasitas_maks: z.number().min(1, "Kapasitas minimum adalah 1."),
    category: z.string().min(1, "Kategori wajib dipilih."),
    tipe_sewa: z.enum(["perhari", "perjam"]),
    harga_per_jam: z.number().optional().nullable().default(null),
    harga_per_hari: z.number().optional().nullable().default(null),
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

type VanueFormValues = z.infer<typeof formSchema>;
// --- End Zod Schema Server-Side ---

export async function POST(request: Request) {
  try {
    // 1. Ambil Sesi Pengguna untuk Otentikasi
    // FIX (Error 2): Konversi ReadonlyHeaders ke objek plain
    const headersObject = Object.fromEntries(await headers());
    const session = await auth.api.getSession({ headers: headersObject });

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    const ownerId = session.user.id;

    // 2. Ambil dan Validasi Data
    const formData: VanueFormValues = await request.json();
    const validatedData = formSchema.safeParse(formData);

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
      selectedFacilities,
    } = validatedData.data;

    // --- Siapkan Data Harga ---
    // FIX (Error 1): Menggunakan new Prisma.Decimal()
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
    for (const facilityName of selectedFacilities) {
      const facility = await prisma.facility.upsert({
        where: { nama_fasilitas: facilityName },
        update: {},
        create: { nama_fasilitas: facilityName },
      });
      facilityConnects.push({ facility_id: facility.facility_id });
    }

    // 3. Buat entri Venue baru di database (Error 3 seharusnya teratasi setelah generate)
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
      },
    });

    // 4. Kirim respons sukses
    return NextResponse.json(
      {
        success: true,
        message: `Venue '${newVenue.nama_ruangan}' successfully added!`,
        venue: newVenue,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating venue:", error);
    return NextResponse.json(
      { message: "Failed to add venue due to a server error." },
      { status: 500 }
    );
  }
}
