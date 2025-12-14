// src/app/(owner)/dashboard/_components/KalederDanKetersedianMain.tsx

"use client";

import { useState, useMemo } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Clock, CheckCircle, XCircle, Loader2, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar"; // Calendar dari Shadcn UI
import useSWR, { Fetcher } from "swr";

// ... (DEFINISI TIPE DATA tetap sama) ...

interface RawApiBooking {
  booking_id: number;
  kode_unik: string;
  nama_pemesan: string;
  tanggal_mulai: string; // E.g., "2026-01-21T00:00:00.000Z"
  jam_mulai: string; // E.g., "1970-01-01T08:00:00.000Z"
  jam_akhir: string | null; // E.g., "1970-01-01T10:00:00.000Z" atau null
  total_harga: string;
  status_booking: "SUCCESS" | "PENDING" | "CANCELED";
  status_midtrans: string | null;
}

interface VenueData {
  id: number;
  nama_ruangan: string;
  bookings: RawApiBooking[];
  // ... properti venue lainnya
}

interface ApiResponse {
  success: boolean;
  data: VenueData[]; // Array of VenueData
}

interface FlattenedBooking {
  id: number;
  venueName: string;
  tanggal_mulai: string; // YYYY-MM-DD
  jam_mulai_time: string; // HH:MM
  jam_selesai_time: string; // HH:MM
  status_booking: "SUCCESS" | "PENDING" | "CANCELED";
  nama_pemesan: string;
}

// ... (API Fetcher dan Helper Functions tetap sama) ...

const API_ENDPOINT = "/api/vanue";
const fetcher: Fetcher<ApiResponse> = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Gagal mengambil data booking dari server.");
  }
  return res.json();
};

const getStatusIcon = (status: FlattenedBooking["status_booking"]) => {
  switch (status) {
    case "SUCCESS":
      return <CheckCircle className="w-3 h-3 text-green-500" title="Sukses" />;
    case "PENDING":
      return <Clock className="w-3 h-3 text-yellow-500" title="Pending" />;
    case "CANCELED":
      return <XCircle className="w-3 h-3 text-red-500" title="Dibatalkan" />;
    default:
      return null;
  }
};

const extractTime = (isoString: string | null): string => {
  if (!isoString) return "Seharian";
  try {
    return format(parseISO(isoString), "HH:mm");
  } catch (e) {
    return "N/A";
  }
};

const KalederDanKetersedianMain = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const {
    data: apiResponse,
    error,
    isLoading,
  } = useSWR<ApiResponse>(API_ENDPOINT, fetcher, { refreshInterval: 60000 });

  const bookings: FlattenedBooking[] = useMemo(() => {
    if (!apiResponse?.data) return [];

    const flattenedBookings: FlattenedBooking[] = [];

    apiResponse.data.forEach((venue: VenueData) => {
      venue.bookings.forEach((booking: RawApiBooking) => {
        const dateOnly = format(parseISO(booking.tanggal_mulai), "yyyy-MM-dd");
        const startTime = extractTime(booking.jam_mulai);
        const endTime = extractTime(booking.jam_akhir);

        flattenedBookings.push({
          id: booking.booking_id,
          venueName: venue.nama_ruangan,
          tanggal_mulai: dateOnly,
          jam_mulai_time: startTime,
          jam_selesai_time: endTime,
          status_booking: booking.status_booking,
          nama_pemesan: booking.nama_pemesan,
        });
      });
    });

    return flattenedBookings;
  }, [apiResponse]);

  const bookingsByDate = useMemo(() => {
    return bookings.reduce((acc, booking) => {
      const dateKey = booking.tanggal_mulai;

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(booking);
      return acc;
    }, {} as Record<string, FlattenedBooking[]>);
  }, [bookings]);

  const dateModifiers = useMemo(() => {
    const datesWithPending: Date[] = [];
    const datesWithSuccess: Date[] = [];

    Object.entries(bookingsByDate).forEach(([dateKey, bookings]) => {
      const dateObj = parseISO(dateKey);

      if (bookings.some((b) => b.status_booking === "PENDING")) {
        datesWithPending.push(dateObj);
      } else if (bookings.some((b) => b.status_booking === "SUCCESS")) {
        datesWithSuccess.push(dateObj);
      }
    });

    return {
      pending: datesWithPending,
      success: datesWithSuccess,
    };
  }, [bookingsByDate]);

  const detailsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return bookingsByDate[dateKey] || [];
  }, [selectedDate, bookingsByDate]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  // --- Tampilan Loading dan Error ---
  if (error) {
    return (
      <div className="container mx-auto p-8 text-red-500">
        Gagal memuat data kalender. Pastikan API berfungsi. Error:{" "}
        {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-yellow-500" />
        <p className="mt-2 text-muted-foreground">
          Memuat kalender dan jadwal booking...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[60vh]">
        {/* Kolom 1: KALENDER UTAMA */}
        <Card className="shadow-xl lg:col-span-2 flex flex-col h-full">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Kalender Booking</CardTitle>
          </CardHeader>

          <CardContent className="p-4 md:p-6 flex-1 flex justify-center items-stretch">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              locale={id}
              className="w-full p-0 border-none shadow-none"
              modifiers={dateModifiers}
              components={{
                DayContent: ({ date, activeModifiers }) => {
                  const dateKey = format(date, "yyyy-MM-dd");
                  const dayBookings = bookingsByDate[dateKey];
                  const isSelected =
                    selectedDate && isSameDay(date, selectedDate);

                  let bookingText = "";
                  let bookingClass = "";
                  let hasBooking = false;

                  if (dayBookings && dayBookings.length > 0) {
                    hasBooking = true;
                    const hasPending =
                      activeModifiers.pending &&
                      dayBookings.some((b) => b.status_booking === "PENDING");

                    if (hasPending) {
                      bookingText = `${dayBookings.length} Pending`;
                      bookingClass =
                        "text-yellow-700 bg-yellow-100 border-yellow-200";
                    } else {
                      bookingText = `${dayBookings.length} Booked`;
                      bookingClass =
                        "text-green-700 bg-green-100 border-green-200";
                    }
                  }

                  return (
                    <div className="relative flex flex-col justify-start items-start h-full p-1 group">
                      {/* Teks Tanggal Asli */}
                      <span
                        className={`z-10 text-sm font-semibold ${
                          isSelected ? "text-white" : ""
                        }`}
                      >
                        {format(date, "d")}
                      </span>

                      {/* Indikator Teks di bawah tanggal */}
                      {hasBooking && (
                        <div
                          className={`mt-1 text-[10px] w-full px-1 py-0.5 rounded-md truncate font-medium border ${bookingClass}`}
                          title={bookingText}
                        >
                          {bookingText}
                        </div>
                      )}
                    </div>
                  );
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Kolom 2: DETAIL BOOKING */}
        {/* Menggunakan h-full agar tingginya sama dengan card Calendar */}
        <Card className="shadow-xl h-full flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">
              Detail Booking
              {selectedDate &&
                `: ${format(selectedDate, "dd MMMM yyyy", { locale: id })}`}
            </CardTitle>
          </CardHeader>
          {/* flex-1 dan overflow-y-auto di sini mengontrol scrolling internal Detail Booking */}
          <CardContent className="p-4 space-y-3 flex-1 overflow-y-auto">
            {!selectedDate ? (
              <p className="text-muted-foreground mt-4">
                Pilih tanggal di kalender untuk melihat detail pesanan.
              </p>
            ) : detailsForSelectedDate.length > 0 ? (
              detailsForSelectedDate.map((booking) => (
                <div
                  key={booking.id}
                  className="border p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800 flex items-center">
                        <Home className="w-3 h-3 mr-1 text-yellow-500" />{" "}
                        {booking.venueName}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {booking.nama_pemesan}
                      </p>
                    </div>
                    {getStatusIcon(booking.status_booking)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium text-gray-700">Waktu:</span>{" "}
                    {booking.jam_mulai_time} - {booking.jam_selesai_time}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground mt-4">
                Tidak ada pesanan pada tanggal ini.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KalederDanKetersedianMain;
