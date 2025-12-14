"use client";

import useSWR from "swr";
// Import semua komponen
import DashboardOverview from "./DashboardOverview";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardChart, RevenueChartData } from "./DashboardChart";
import DashboardUpComing from "./DashboardUpComing";

// --- 1. DEFINISI TIPE DATA (Diekspor untuk penggunaan di komponen lain) ---
export interface Booking {
  booking_id: number;
  total_harga: string;
  status_booking: string;
  tanggal_mulai: string;
  jam_mulai: string; // Diperlukan untuk upcoming bookings
  nama_pemesan: string; // Diperlukan untuk upcoming bookings
  kode_unik: string; // Diperlukan untuk upcoming bookings
}

interface Ruangan {
  id: number; // Diperlukan untuk upcoming bookings (venueName)
  nama_ruangan: string; // Diperlukan untuk upcoming bookings
  bookings: Booking[];
}

interface ApiResponse {
  success: boolean;
  data: Ruangan[];
}

// --- 2. FUNGSI FETCHER ---
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorDetail = await res.json();
    throw new Error(errorDetail.message || "Gagal mengambil data.");
  }
  return res.json();
};

// --- 3. FUNGSI PERHITUNGAN METRIK (Total Revenue) ---
function hitungTotalRevenue(venues: Ruangan[]): number {
  if (!venues || venues.length === 0) {
    return 0;
  }

  const allBookings = venues.flatMap((venue) => venue.bookings || []);
  let totalRevenue = 0;

  allBookings.forEach((booking) => {
    if (booking.status_booking === "SUCCESS") {
      const harga = parseFloat(booking.total_harga);

      if (!isNaN(harga)) {
        totalRevenue += harga;
      }
    }
  });
  return totalRevenue;
}

// --- 4. FUNGSI AGREGRASI DATA UNTUK CHART ---
function aggregateRevenueByDay(venues: Ruangan[]): RevenueChartData[] {
  if (!venues || venues.length === 0) {
    return [];
  }

  const allBookings = venues.flatMap((venue) => venue.bookings || []);
  const revenueMap = new Map<string, number>();

  allBookings.forEach((booking) => {
    if (booking.status_booking === "SUCCESS" && booking.tanggal_mulai) {
      const dateKey = booking.tanggal_mulai.substring(0, 10);
      const harga = parseFloat(booking.total_harga);

      if (!isNaN(harga)) {
        const currentRevenue = revenueMap.get(dateKey) || 0;
        revenueMap.set(dateKey, currentRevenue + harga);
      }
    }
  });

  const chartData: RevenueChartData[] = Array.from(revenueMap.entries())
    .map(([date, revenue]) => ({
      date,
      revenue,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return chartData;
}

// --- 5. KOMPONEN UTAMA DASHBOARD ---
const DashboardMain = () => {
  const API_ENDPOINT = "/api/vanue";

  const {
    data: apiResponse,
    error,
    isLoading,
  } = useSWR<ApiResponse>(API_ENDPOINT, fetcher);

  const allVenues = apiResponse?.data; // Data mentah untuk dioper ke UpComing
  const venues = apiResponse?.data || [];

  // --- Perhitungan Metrik ---
  const TotalVanue = venues.length;
  const TotalRevanue = hitungTotalRevenue(venues);

  const allBookings = venues.flatMap((venue) => venue.bookings || []);
  const TotalBookingSuccess = allBookings.filter(
    (b) => b.status_booking === "SUCCESS"
  ).length;
  const TotalBookingAll = allBookings.length;

  const ConversionRate =
    TotalBookingAll > 0 ? (TotalBookingSuccess / TotalBookingAll) * 100 : 0;
  const formattedConversionRate = parseFloat(ConversionRate.toFixed(2));

  // Perhitungan Data Chart
  const revenueChartData = aggregateRevenueByDay(venues);

  // --- DEBUGGING LOG (Hapus jika sudah production) ---
  if (process.env.NODE_ENV === "development") {
    console.log("Data Chart Revenue:", revenueChartData);
  }

  // --- Tampilan Loading dan Error ---
  if (error) {
    return (
      <div className="p-4 md:p-8 text-red-600">
        Gagal memuat data dashboard. Error: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full p-4 space-x-4 grid grid-cols-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="col-span-4 h-[300px] rounded-2xl mt-4" />
      </div>
    );
  }

  // --- Props untuk Overview ---
  const dashboardProps = {
    TotalVanue,
    TotalBooking: TotalBookingSuccess,
    TotalRevanue,
    ConversionRate: formattedConversionRate,
  };

  return (
    <div className="p-4 md:p-8 space-y-6 ">
      {/* 1. Overview Metrik */}
      <DashboardOverview {...dashboardProps} />

      <DashboardChart chartData={revenueChartData} />

      <div className="lg:col-span-1">
        <DashboardUpComing
          allVenues={allVenues}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};

export default DashboardMain;
