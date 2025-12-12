// src/type/booking.ts

/**
 * Tipe data untuk detail Venue yang disematkan dalam respons Booking.
 */
export interface VenueData {
  nama_ruangan: string;
  alamat_venue: string;
  tipe_sewa: string;
}

/**
 * Tipe data untuk objek booking utama yang dikembalikan oleh API detail transaksi.
 */
export interface BookingApiResponseData {
  booking_id: number;
  kode_unik: string;
  email_pemesan: string;
  telepon_pemesan: string;
  tanggal_mulai: string;
  jam_mulai: string;
  total_harga: number;
  // Status backend Midtrans/lokal yang sebenarnya
  status_booking: "SUCCESS" | "PENDING" | "FAILURE";
  status_midtrans: string | null;
  notes_pemesan: string;
  venue: VenueData;
}

/**
 * Tipe Response API Penuh untuk detail booking.
 */
export interface ApiBookingDetailResponse {
  success: boolean;
  data: BookingApiResponseData;
}
