interface CategoryDetail {
  nama_kategori: string;
}

interface VenueCategoryWrapper {
  category: CategoryDetail;
}

interface RoomImage {
  image_url: string;
}

interface FacilityDetail {
  nama_fasilitas: string;
}
interface VenueFacilityWrapper {
  facility: FacilityDetail;
}

export interface Venue {
  id: number;
  nama_ruangan: string;
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
}

export interface ApiResponse {
  success: boolean;
  data: Venue[];
}

export interface VenueDetail extends Venue {
  deskripsi_venue: string;
  alamat_venue: string;
  venueFacilities: VenueFacilityWrapper[];
}

export interface ApiDetailResponse {
  success: boolean;
  data: VenueDetail | null;
}

export interface ApiDetailPopuler {
  success: boolean;
  data: Venue[];
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
