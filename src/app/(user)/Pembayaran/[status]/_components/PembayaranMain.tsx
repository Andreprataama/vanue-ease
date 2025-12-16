"use client";

import useSWR, { Fetcher } from "swr";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
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
import { toast } from "sonner";
const fetcher: Fetcher<ApiBookingDetailResponse> = (url: string) =>
  fetch(url).then((res) => res.json());

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess: () => void;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onPending: (result: any) => void;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onError: (result: any) => void;
          onClose: () => void;
        }
      ) => void;
    };
  }
}

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

interface PembayaranMainProps {
  status: "success" | "pending" | "failure" | "onclose";
}

const PembayaranMain = ({ status }: PembayaranMainProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRepaying, setIsRepaying] = useState(false);

  const orderId = searchParams.get("order_id");
  const apiUrl = orderId ? `/api/booking/${orderId}` : null;

  const {
    data: bookingResponse,
    error,
    isLoading,
    mutate,
  } = useSWR<ApiBookingDetailResponse>(apiUrl, fetcher);

  const handleDownloadInvoice = () => {
    const invoiceUrl = `/api/booking/${orderId}/invoice`;
    window.open(invoiceUrl, "_blank");
  };

  const handleRepay = async (currentOrderId: string) => {
    setIsRepaying(true);

    if (!currentOrderId) {
      toast.error("Error: Kode Booking tidak ditemukan.");
      setIsRepaying(false);
      return;
    }

    try {
      const response = await fetch(`/api/booking/${currentOrderId}/repay`, {
        method: "GET",
      });

      const result = await response.json();

      if (!response.ok || !result.snapToken) {
        console.error("Repay API Error Response:", result);
        throw new Error(
          result.message ||
            result.detail ||
            "Gagal mendapatkan token pembayaran baru."
        );
      }

      const snapToken = result.snapToken;

      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: () => {
            toast.success("Pembayaran berhasil. Menunggu konfirmasi status...");

            setTimeout(() => {
              mutate(); // Force re-fetch status terbaru
              router.push(`/Pembayaran/success?order_id=${currentOrderId}`);
            }, 3000);
            // ---------------------------------
          },
          onPending: () => {
            toast.warning("Pembayaran tertunda. Mohon selesaikan.");
            mutate();
            router.push(`/Pembayaran/pending?order_id=${currentOrderId}`);
          },
          onError: (midtransError) => {
            console.error("Midtrans Snap Error:", midtransError);
            toast.error("Pembayaran gagal. Silakan coba lagi.");
            mutate();
            router.push(`/Pembayaran/failure?order_id=${currentOrderId}`);
          },
          onClose: () => {
            toast.info("Jendela ditutup. Status tetap Pending.");
            // Tidak perlu mutate
          },
        });
      } else {
        toast.error("Midtrans Snap belum dimuat dengan benar.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Repay Error:", error);
      toast.error(error.message || "Gagal memproses ulang pembayaran.");
    } finally {
      setIsRepaying(false);
    }
  };

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

  // --- Penentuan Status Efektif ---
  let effectiveStatusKey: keyof typeof statusMetadata = "failure";
  const backendStatus = bookingData.status_booking.toLowerCase();

  if (backendStatus === "success") {
    effectiveStatusKey = "success";
  } else if (backendStatus === "pending") {
    effectiveStatusKey = status === "onclose" ? "onclose" : "pending";
  } else {
    effectiveStatusKey = "failure";
  }

  const metadata = statusMetadata[effectiveStatusKey];
  const StatusIcon = metadata.icon;

  const renderStatusSpecificContent = () => {
    switch (effectiveStatusKey) {
      case "success":
        return (
          <>
            <p className="text-sm font-semibold mt-4 text-green-600">
              Transaksi Anda Sukses dan sudah lunas.
            </p>
            <Button
              onClick={handleDownloadInvoice}
              className="w-full bg-green-600 hover:bg-green-700 mt-4"
            >
              Download Struk / Faktur
            </Button>

            <Button
              onClick={() => router.push("/Tempat")}
              variant="outline"
              className="w-full mt-2"
            >
              Kembali Cari Tempat
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
                Menunggu Pembayaran
              </p>
              <p className="text-sm">
                Mohon selesaikan pembayaran. Anda dapat melanjutkan melalui
                tombol di bawah.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <Button
                onClick={() => handleRepay(bookingData.kode_unik)}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                disabled={isRepaying}
              >
                {isRepaying ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  "Lanjutkan Pembayaran Sekarang"
                )}
              </Button>
              <Button
                onClick={() => router.push("/dashboard/riwayat-pesanan")}
                variant="outline"
                className="w-full"
              >
                Cek Status Nanti
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

  return (
    <div className="container mx-auto py-10 md:py-20 max-w-2xl p-5 md:p-0">
      <Card
        className={`border-t-8 ${metadata.color.replace("text", "border")}`}
      >
        <CardHeader className="text-center">
          <StatusIcon className={`w-12 h-12 mx-auto mb-3 ${metadata.color}`} />
          <CardTitle className="text-3xl">{metadata.title}</CardTitle>
          <p className="text-muted-foreground mt-2">{metadata.detail}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Section 1: Ringkasan Transaksi & Harga */}
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

          {/* Section 3: Detail Waktu & Pemesan */}
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
