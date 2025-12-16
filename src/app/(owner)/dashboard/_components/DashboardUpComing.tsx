"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";

import { formatRupiah } from "@/utils/currency";

import { Booking } from "./DashboardMain"; // Import Booking interface

interface DashboardUpComingProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allVenues: any[] | undefined;
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

// --- TIPE FILTER ---
type FilterType = "TODAY" | "7_DAYS" | "30_DAYS";

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: "Hari Ini", value: "TODAY" },
  { label: "7 Hari Ke Depan", value: "7_DAYS" },
  { label: "30 Hari Ke Depan", value: "30_DAYS" },
];

/**
 * Helper untuk mendapatkan tanggal batas atas (end date) untuk filter
 * @param filter Jenis filter
 * @returns Objek Date batas atas
 */
const getEndDate = (filter: FilterType): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(today);

  switch (filter) {
    case "TODAY":
      endDate.setDate(today.getDate() + 1); // Hingga 00:00 besok
      break;
    case "7_DAYS":
      endDate.setDate(today.getDate() + 7);
      break;
    case "30_DAYS":
      endDate.setDate(today.getDate() + 30);
      break;
  }
  return endDate;
};

/**
 * Filter data booking yang akan datang berdasarkan periode
 */
const filterUpcomingBookings = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  venues: any[],
  filter: FilterType
): (Booking & { venueName: string })[] => {
  if (!venues || venues.length === 0) return [];

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const endDate = getEndDate(filter);

  const upcomingBookings: (Booking & { venueName: string })[] = [];

  venues.forEach((venue) => {
    const venueName = venue.nama_ruangan;
    venue.bookings?.forEach((booking: Booking) => {
      const bookingDate = new Date(booking.tanggal_mulai.substring(0, 10));
      bookingDate.setHours(0, 0, 0, 0);
      // Filter: SUCCESS, di masa depan/hari ini, dan di dalam rentang filter
      if (
        booking.status_booking === "SUCCESS" &&
        bookingDate >= now &&
        bookingDate < endDate
      ) {
        upcomingBookings.push({ ...booking, venueName });
      }
    });
  });

  // Urutkan berdasarkan tanggal terdekat
  return upcomingBookings.sort(
    (a, b) =>
      new Date(a.tanggal_mulai).getTime() - new Date(b.tanggal_mulai).getTime()
  );
};

const DashboardUpComing = ({
  allVenues,
  isLoading,
  error,
}: DashboardUpComingProps) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("7_DAYS");

  const filteredData = useMemo(() => {
    if (!allVenues) return [];
    return filterUpcomingBookings(allVenues, activeFilter);
  }, [allVenues, activeFilter]);

  if (error) {
    return <div className="text-red-500">Gagal memuat data transaksi.</div>;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">
          Transaksi Mendatang
        </CardTitle>
        <Clock className="h-6 w-6 text-yellow-500" />
      </CardHeader>

      <CardContent>
        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-4 overflow-x-scroll ">
          {FILTER_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={activeFilter === opt.value ? "default" : "outline"}
              size="sm"
              className={
                activeFilter === opt.value
                  ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                  : "hover:bg-gray-100"
              }
              onClick={() => setActiveFilter(opt.value)}
              disabled={isLoading}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
            <span className="ml-2">Memuat Transaksi...</span>
          </div>
        )}

        {/* Data List */}
        {!isLoading && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredData.length > 0 ? (
              filteredData.map((booking) => (
                <div
                  key={booking.booking_id}
                  className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    {/* Data Kiri: Venue Name & Pemesan */}
                    <div className="flex flex-col pr-4">
                      <p className="font-semibold text-gray-800">
                        {booking.venueName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Oleh: {booking.nama_pemesan}
                      </p>
                    </div>

                    {/* Data Kanan: Total Harga */}
                    <div className="flex flex-col items-end">
                      <p className="text-xs text-muted-foreground mt-0">
                        Total
                      </p>
                      <span className="text-lg font-bold text-yellow-500">
                        {formatRupiah({
                          price: parseFloat(booking.total_harga),
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-xs mt-3 space-x-3 border-t pt-2">
                    {/* Tanggal Mulai */}
                    <span className="flex items-center">
                      <CalendarIcon className="w-3 h-3 mr-1 text-gray-500" />
                      {new Date(booking.tanggal_mulai).toLocaleDateString(
                        "id-ID",
                        { year: "numeric", month: "short", day: "numeric" }
                      )}
                    </span>
                    {/* Jam Mulai */}
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-gray-500" />
                      {new Date(booking.jam_mulai).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Kode: {booking.kode_unik}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                Tidak ada transaksi sukses yang akan datang dalam{" "}
                {FILTER_OPTIONS.find((f) => f.value === activeFilter)?.label}.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardUpComing;
