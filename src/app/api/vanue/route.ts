// src/app/api/vanue/route.ts (DIKOREKSI)

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";

import prisma from "@/utils/prisma";
import { auth } from "@/lib/auth";
import { Prisma } from "@/generated/prisma/client";

// CATATAN PENTING: Untuk Next.js App Router (route.ts), tidak perlu
// mengekspor 'config' untuk menonaktifkan bodyParser. Menggunakan request.formData()
// sudah didukung secara default. Blok kode 'export const config = ...' yang lama
// telah dihapus.

// --- Zod Schema Server-Side ---
const formSchema = z
  .object({
    nama_ruangan: z.string().min(1, "Nama Vanue wajib diisi."),
    deskripsi_venue: z.string().min(1, "Deskripsi wajib diisi."),
    alamat_venue: z
      .string()
      .url("Alamat harus berupa link yang valid.")
      .or(z.string().min(1, "Alamat Google Maps wajib diisi.")),
    kapasitas_maks: z.coerce.number().min(1, "Kapasitas minimum adalah 1."),
    category: z.string().min(1, "Kategori wajib dipilih."),
    tipe_sewa: z.enum(["perhari", "perjam"]),
    harga_per_jam: z.coerce.number().optional().nullable().default(null),
    harga_per_hari: z.coerce.number().optional().nullable().default(null),
    fasilitas_kustom: z.string().optional(),
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

// --- GET HANDLER: Mengambil daftar Vanue ---
export async function GET(request: Request) {
  try {
    const headersObject = Object.fromEntries(await headers());
    const session = await auth.api.getSession({ headers: headersObject }); //

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    const ownerId = session.user.id;

    // 2. Ambil data venue milik owner
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
        images: {
          where: { is_primary: true },
          select: { image_url: true },
        },
        venueCategories: {
          select: { category: { select: { nama_kategori: true } } },
        },
      },
    });

    // 3. Kirim respons sukses
    return NextResponse.json({ success: true, data: venues }, { status: 200 });
  } catch (error) {
    console.error("Error fetching venues:", error);
    return NextResponse.json(
      { message: "Failed to fetch venues due to a server error." },
      { status: 500 }
    );
  }
}

// --- POST HANDLER: Menambah Vanue (Sudah mendukung FormData) ---
export async function POST(request: Request) {
  try {
    // 1. Otentikasi
    const headersObject = Object.fromEntries(await headers());
    const session = await auth.api.getSession({ headers: headersObject }); //

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    const ownerId = session.user.id;

    // 2. Ambil FormData
    const formData = await request.formData();

    // Konversi FormData ke objek untuk validasi Zod
    const rawData = Object.fromEntries(formData.entries());

    // Mengambil semua nilai 'selectedFacilities' (karena bisa multi-value di FormData)
    const selectedFacilities = formData.getAll("selectedFacilities") || [];

    // Gabungkan kembali dengan rawData dan konversi nilai 'null'/'kosong'
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

    // Lakukan validasi Zod
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

    // --- Pemrosesan File Gambar (Simulasi Penyimpanan) ---
    const imageLinks: {
      image_url: string;
      is_primary: boolean;
      sort_order: number;
    }[] = [];

    for (let i = 0; i < 5; i++) {
      const key = `image_${i}`;
      const fileEntry = formData.get(key);

      if (fileEntry instanceof File && fileEntry.size > 0) {
        // SIMULASI: Di sini harusnya logika pengunggahan ke Cloud Storage.
        const isPrimary = i === 0;
        const filename = fileEntry.name.replace(/\s/g, "_");
        const venueNameSlug = nama_ruangan
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        const placeholderUrl = `/uploads/venue/${venueNameSlug}_${i}_${filename}`;

        imageLinks.push({
          image_url: placeholderUrl,
          is_primary: isPrimary,
          sort_order: i,
        });
      }
    }

    // Tambahkan Gambar Default jika tidak ada
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
    for (const facilityName of selectedFacilities) {
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
        // Tambahkan data gambar
        images: {
          createMany: {
            data: imageLinks,
          },
        },
      },
    });

    // 4. Kirim respons sukses
    return NextResponse.json(
      {
        success: true,
        message: `Venue '${newVenue.nama_ruangan}' berhasil ditambahkan, termasuk ${imageLinks.length} gambar!`,
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
