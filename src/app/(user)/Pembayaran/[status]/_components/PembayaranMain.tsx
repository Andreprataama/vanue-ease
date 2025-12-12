// src/app/Pembayaran/[status]/_components/PembayaranMain.tsx

"use client";

import useSWR, { Fetcher } from "swr";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  CalendarIcon,
  Clock,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock4,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { formatRupiah } from "@/utils/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ApiBookingDetailResponse } from "@/type/booking";

interface PembayaranMainProps {
  status: "success" | "pending" | "failure" | "onclose";
}

const fetcher: Fetcher<ApiBookingDetailResponse> = (url: string) =>
  fetch(url).then((res) => res.json());

const statusMetadata = {
  success: {
    title: "Pembayaran Berhasil!",
    icon: CheckCircle,
    color: "text-green-500",
    detail: "Booking Anda telah dikonfirmasi dan lunas.",
  },
  pending: {
    title: "Menunggu Pembayaran",
    icon: Clock4,
    color: "text-yellow-500",
    detail: "Selesaikan pembayaran Anda dalam batas waktu.",
  },
  failure: {
    title: "Pembayaran Gagal",
    icon: XCircle,
    color: "text-red-500",
    detail: "Transaksi Anda dibatalkan atau gagal.",
  },
  onclose: {
    title: "Pembayaran Ditutup",
    icon: Clock4,
    color: "text-yellow-500",
    detail: "Jendela pembayaran ditutup. Status masih Pending.",
  },
};

const PembayaranMain = ({ status }: PembayaranMainProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("order_id");
  const apiUrl = orderId ? `/api/booking/${orderId}` : null;

  const {
    data: bookingResponse,
    error,
    isLoading,
  } = useSWR<ApiBookingDetailResponse>(apiUrl, fetcher);

  if (error) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl text-red-500">
          ❌ Gagal memuat detail transaksi.
        </h1>
        <Button onClick={() => router.push("/")} className="mt-4">
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  if (isLoading || !orderId) {
    return (
      <div className="container mx-auto py-20 text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
        <p className="mt-2 text-gray-600">Memuat detail transaksi...</p>
      </div>
    );
  }

  const bookingData = bookingResponse?.data;

  if (!bookingData) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl text-red-500">ID Transaksi tidak ditemukan.</h1>
        <Button onClick={() => router.push("/")} className="mt-4">
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  const metadata = statusMetadata[status] || statusMetadata.pending;
  const StatusIcon = metadata.icon;

  // --- Fungsi untuk Merender Bagian Aksi & Informasi Khusus ---
  const renderStatusSpecificContent = () => {
    switch (status) {
      case "success":
        return (
          <>
            <p className="text-sm font-semibold mt-4 text-green-600">
              Transaksi Anda Sukses!
            </p>
            <Button
              onClick={() => router.push("/dashboard/riwayat-pesanan")}
              className="w-full bg-green-600 hover:bg-green-700 mt-4"
            >
              Lihat Bukti Transaksi & Riwayat
            </Button>
          </>
        );

      case "pending":
      case "onclose":
        return (
          <>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 space-y-2 my-4">
              <p className="font-semibold flex items-center text-yellow-700">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Status Midtrans: Menunggu Pembayaran
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <Button
                onClick={() =>
                  alert(
                    "Fungsi Lanjutkan Pembayaran (Midtrans Re-pay) belum diimplementasikan."
                  )
                }
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                Lanjutkan Pembayaran Sekarang
              </Button>
            </div>
          </>
        );

      case "failure":
        return (
          <>
            <p className="text-sm font-semibold mt-4 text-red-600">
              Transaksi Anda Gagal diproses. Pesanan ini dibatalkan.
            </p>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 space-y-2 my-4">
              <p className="font-semibold flex items-center text-red-700">
                <XCircle className="w-5 h-5 mr-2" />
                Informasi: Dana tidak dipotong (jika ada).
              </p>
            </div>
            <Button
              onClick={() =>
                router.push(`/Tempat/${bookingData.venue.nama_ruangan}`)
              }
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Ulangi Pemesanan
            </Button>
          </>
        );

      default:
        return (
          <p className="text-muted-foreground mt-2">Status tidak dikenal. </p>
        );
    }
  };

  // --- Tampilan Utama ---
  return (
    <div className="container mx-auto py-20 max-w-2xl">
      <Card
        className={`border-t-8 ${metadata.color.replace("text", "border")}`}
      >
        <CardHeader className="text-center">
          <StatusIcon className={`w-12 h-12 mx-auto mb-3 ${metadata.color}`} />
          <CardTitle className="text-3xl">{metadata.title}</CardTitle>
          <p className="text-muted-foreground mt-2">{metadata.detail}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Section 1: Ringkasan Transaksi */}
          <h3 className="text-xl font-bold border-b pb-2">
            Ringkasan Transaksi
          </h3>
          <div className="space-y-2">
            <p className="font-semibold text-lg">
              Kode Booking:{" "}
              <span className="text-primary">{bookingData.kode_unik}</span>
            </p>
            <div className="flex justify-between items-center text-lg font-bold">
              <div className="flex items-center text-muted-foreground">
                <DollarSign className="w-5 h-5 mr-2" /> Total Pembayaran
              </div>
              <span className={`text-2xl ${metadata.color}`}>
                {formatRupiah({ price: bookingData.total_harga })}
              </span>
            </div>
          </div>

          {/* Section 2: KONTEN SPESIFIK STATUS DAN TOMBOL AKSI */}
          <div className="pt-4 border-t">{renderStatusSpecificContent()}</div>

          {/* Section 3: Detail Pemesanan (Dibuat opsional) */}
          <h3 className="text-xl font-bold border-t pt-4">
            Detail Waktu & Pemesan
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-muted-foreground">
                <CalendarIcon className="w-4 h-4 mr-2" /> Tanggal
              </div>
              <span className="font-semibold">{bookingData.tanggal_mulai}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" /> Waktu Mulai
              </div>
              <span className="font-semibold">{bookingData.jam_mulai}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center text-muted-foreground">
                <Users className="w-4 h-4 mr-2" /> Pemesan
              </div>
              <span className="font-semibold">{bookingData.email_pemesan}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PembayaranMain;
