export interface Venue {
  id: number;
  nama_ruangan: string;
  tipe_sewa: "perhari" | "perjam" | null;
  harga_per_jam: number | null;
  harga_per_hari: number | null;
  kapasitas_maks: number | null;
  // BARU: Tambahkan struktur images
  images?: { image_url: string; is_primary?: boolean; sort_order?: number }[];
}

export interface VenueFormData {
  // 1. DETAIL UTAMA
  nama_ruangan: string;
  deskripsi_venue: string;
  alamat_venue: string;
  kapasitas_maks: number; // Diserahkan sebagai number setelah Zod coerce

  // 2. HARGA & TIPE
  tipe_sewa: "perhari" | "perjam";
  // Diserahkan sebagai number atau null. API backend Anda akan mengubahnya menjadi Prisma.Decimal.
  harga_per_jam: number | null;
  harga_per_hari: number | null;

  // 3. RELASI & KLASIFIKASI
  category: string; // Nama kategori
  selectedFacilities: string[]; // Array of facility names

  // 4. OPSIONAL
  fasilitas_kustom?: string | null;
  peraturan_venue?: string | null;
}
