// File: src/type/venua.ts

// --- 1. Tipe Relasi Dasar ---

interface CategoryDetail {
  nama_kategori: string;
}

interface VenueCategoryWrapper {
  category: CategoryDetail;
}

interface RoomImage {
  image_url: string;
}

// Tambahan: Struktur untuk Fasilitas yang dipilih di API Detail
interface FacilityDetail {
  nama_fasilitas: string;
}
interface VenueFacilityWrapper {
  facility: FacilityDetail;
}

// --- 2. Tipe Venue untuk LIST (Data Anda Saat Ini) ---

export interface Venue {
  id: number;
  nama_ruangan: string;

  // Properti opsional (bisa null/undefined di list API)
  deskripsi_venue?: string;
  alamat_venue?: string;
  fasilitas_kustom?: string | null;
  peraturan_venue?: string | null;

  // Properti wajib
  tipe_sewa: "perhari" | "perjam" | null;
  harga_per_jam: string | null;
  harga_per_hari: string | null;
  kapasitas_maks: number | null;

  images: RoomImage[];
  venueCategories: VenueCategoryWrapper[];

  // Catatan: VenueFacilities TIDAK ada di tipe list Anda, tapi ada di Detail.
}

// Tipe Response untuk LIST
export interface ApiResponse {
  success: boolean;
  data: Venue[];
}

// --- 3. Tipe Venue untuk DETAIL (API /vanue/[id]) ---

// VenueDetail mewarisi properti Venue, tetapi beberapa properti menjadi wajib
export interface VenueDetail extends Venue {
  // Properti yang WAJIB ada dan selalu di-select di detail:
  deskripsi_venue: string; // Dianggap wajib di halaman detail
  alamat_venue: string; // Dianggap wajib di halaman detail

  venueFacilities: VenueFacilityWrapper[];
}

// Tipe Response untuk DETAIL
export interface ApiDetailResponse {
  success: boolean;
  data: VenueDetail | null; // Mengembalikan objek tunggal atau null
}

interface VenueData {
  nama_ruangan: string;
  alamat_venue: string;
  tipe_sewa: string;
}

interface BookingApiResponseData {
  booking_id: number;
  kode_unik: string;
  email_pemesan: string;
  telepon_pemesan: string;
  tanggal_mulai: string;
  jam_mulai: string;
  total_harga: number;
  status_booking: "SUCCESS" | "PENDING" | "FAILURE";
  status_midtrans: string | null;
  notes_pemesan: string;
  venue: VenueData;
}

interface VenueData {
  nama_ruangan: string;
  alamat_venue: string;
  tipe_sewa: string;
}
