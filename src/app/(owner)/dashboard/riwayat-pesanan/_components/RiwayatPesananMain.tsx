"use client";

import { useState, useMemo } from "react";
import useSWR, { Fetcher } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { formatRupiah } from "@/utils/currency";
import { Button } from "@/components/ui/button";

interface Booking {
  kode_unik: string;
  nama_pemesan: string;
  tanggal_mulai: string;
  jam_mulai: string;
  total_harga: string;
  status_booking: StatusFilter;
}

interface Ruangan {
  id: number;
  nama_ruangan: string;
  bookings: Booking[];
}

interface ApiResponse {
  success: boolean;
  data: Ruangan[];
}

interface CombinedBooking extends Booking {
  venueName: string;
}

const fetcher: Fetcher<ApiResponse> = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Gagal mengambil riwayat pesanan.");
    return res.json();
  });

type StatusFilter = "ALL" | "SUCCESS" | "PENDING" | "CANCELED";

const ITEMS_PER_PAGE = 10;

const StatusFilters = {
  ALL: {
    label: "Semua Status",
    icon: Package,
    className: "bg-gray-100 text-gray-700",
  },
  SUCCESS: {
    label: "Sukses",
    icon: CheckCircle,
    className: "bg-green-100 text-green-700",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-700",
  },
  CANCELED: {
    label: "Batal",
    icon: XCircle,
    className: "bg-red-100 text-red-700",
  },
} as const;

const getStatusBadge = (status: string) => {
  const statusKey = status as keyof typeof StatusFilters;
  const statusInfo = StatusFilters[statusKey] || {
    label: status,
    icon: Package,
    className: "bg-gray-100 text-gray-700",
  };
  const Icon = statusInfo.icon;

  const baseClass =
    "px-2 py-0.5 text-xs font-semibold rounded-full flex items-center justify-center w-20 whitespace-nowrap";

  return (
    <span className={`${baseClass} ${statusInfo.className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {statusInfo.label}
    </span>
  );
};

const TableSkeleton: React.FC = () => (
  <TableBody>
    {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
      <TableRow key={index} className="animate-pulse">
        <TableCell className="w-[120px] py-3">
          <div className="h-4 bg-gray-200 rounded"></div>
        </TableCell>
        <TableCell className="py-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </TableCell>
        <TableCell className="hidden md:table-cell py-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </TableCell>
        <TableCell className="py-3">
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </TableCell>
        <TableCell className="text-right py-3">
          <div className="h-4 bg-gray-200 rounded w-3/4 ml-auto"></div>
        </TableCell>
        <TableCell className="text-center py-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
);

const RiwayatPesananMain = () => {
  const API_ENDPOINT = "/api/vanue";
  const {
    data: apiResponse,
    error,
    isLoading,
  } = useSWR<ApiResponse>(API_ENDPOINT, fetcher);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1); // **STATE BARU: Halaman Saat Ini**

  // 1. Menggabungkan dan Sorting Data
  const allBookings = useMemo(() => {
    if (!apiResponse?.data) return [];

    const bookings: CombinedBooking[] = [];
    apiResponse.data.forEach((venue) => {
      venue.bookings?.forEach((booking) => {
        bookings.push({
          ...booking,
          venueName: venue.nama_ruangan,
        });
      });
    });

    return bookings.sort(
      (a, b) =>
        new Date(b.tanggal_mulai).getTime() -
        new Date(a.tanggal_mulai).getTime()
    );
  }, [apiResponse]);

  const filteredBookings = useMemo(() => {
    // eslint-disable-next-line react-hooks/set-state-in-render
    setCurrentPage(1);
    let result = allBookings;

    if (statusFilter !== "ALL") {
      result = result.filter((b) => b.status_booking === statusFilter);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (b) =>
          b.nama_pemesan?.toLowerCase().includes(lowerSearch) ||
          b.venueName?.toLowerCase().includes(lowerSearch) ||
          b.kode_unik?.toLowerCase().includes(lowerSearch)
      );
    }

    return result;
  }, [allBookings, statusFilter, searchTerm]);

  // 3. Paginasi Data
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredBookings.slice(startIndex, endIndex);
  }, [filteredBookings, currentPage]);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Card className="border-red-500 bg-red-50">
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-700 font-medium">
              Gagal memuat riwayat pesanan. Error: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container w-fullmx-auto p-4 md:p-8 space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Riwayat Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center ">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari pemesan, venue, atau kode unik..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 border-gray-300 focus:border-yellow-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500 shrink-0 hidden sm:block" />
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as StatusFilter)}
              >
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(StatusFilters).map(
                    ([key, { label, icon: Icon }]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        className="flex items-center"
                      >
                        <Icon className="w-4 h-4 mr-2 text-yellow-600" />
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="">
                <TableRow className="bg-yellow-50 hover:bg-yellow-50/80 ">
                  <TableHead className=" font-bold text-gray-700">
                    Kode Unik
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    Venue & Pemesan
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 ">
                    Pemesan
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 ">
                    Waktu Booking
                  </TableHead>
                  <TableHead className=" font-bold text-gray-700 ">
                    Total Harga
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              {isLoading ? (
                <TableSkeleton />
              ) : (
                <TableBody>
                  {paginatedBookings.length > 0 ? (
                    paginatedBookings.map((booking) => (
                      <TableRow
                        key={booking.kode_unik}
                        className="hover:bg-yellow-50/30 transition-colors border-b last:border-b-0"
                      >
                        {/* 1. Kode Unik */}
                        <TableCell className="font-mono text-xs text-gray-700  font-semibold">
                          {booking.kode_unik}
                        </TableCell>

                        {/* 2. Venue  */}
                        <TableCell className="text-sm py-3">
                          <p className="font-semibold  text-gray-900">
                            {booking.venueName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 md:hidden">
                            Oleh: {booking.nama_pemesan}
                          </p>
                        </TableCell>

                        {/* 3. Pemesan (Hanya Desktop) */}
                        <TableCell className="text-sm text-gray-700 hidden md:table-cell py-3">
                          <span className="truncate  block">
                            {booking.nama_pemesan}
                          </span>
                        </TableCell>

                        {/* 4. Waktu Booking */}
                        <TableCell className="text-sm py-3">
                          <p className="font-medium text-gray-800">
                            {new Date(booking.tanggal_mulai).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </TableCell>

                        {/* 5. Total Harga */}
                        <TableCell className=" font-extrabold text-base text-yellow-700 ">
                          {formatRupiah({
                            price: parseFloat(booking.total_harga),
                          })}
                        </TableCell>

                        {/* 6. Status */}
                        <TableCell className="text-center">
                          {getStatusBadge(booking.status_booking)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-gray-500"
                      >
                        <Package className="w-5 h-5 mx-auto mb-2" />
                        Tidak ada riwayat pesanan yang cocok dengan kriteria
                        filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              )}
            </Table>
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-4">
              <Button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="text-gray-600 border-gray-300"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
              </Button>

              <div className="text-sm font-medium text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </div>

              <Button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="text-gray-600 border-gray-300"
              >
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Menampilkan jumlah total item yang difilter (opsional, tapi baik untuk UX) */}
          <div className="text-xs text-muted-foreground text-right pt-2">
            Menampilkan {Math.min(ITEMS_PER_PAGE, paginatedBookings.length)}{" "}
            dari {totalItems} total pesanan yang difilter.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiwayatPesananMain;
