// src/app/Pembayaran/[status]/_components/ViewPending.tsx

"use client";
import React from "react";
import { Clock4, AlertTriangle, DollarSign, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/utils/currency";
import { BookingApiResponseData } from "@/type/booking";

interface StatusViewProps {
  booking: BookingApiResponseData;
}

const ViewPending: React.FC<StatusViewProps> = ({ booking }) => {
  const router = useRouter();

  return (
    <Card className="shadow-lg border-yellow-500/50">
      <CardHeader className="text-center">
        <Clock4 className="w-16 h-16 mx-auto mb-3 text-yellow-500" />
        <CardTitle className="text-3xl text-yellow-600">
          Menunggu Pembayaran
        </CardTitle>
        <p className="text-muted-foreground mt-2">
          Pesanan Anda berhasil dibuat. Mohon segera selesaikan pembayaran.
        </p>
        <p className="text-sm font-semibold mt-4">
          Kode Booking:{" "}
          <span className="text-primary">{booking.kode_unik}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* --- Detail Pembayaran --- */}
        <h3 className="text-xl font-bold border-b pb-2 text-yellow-600">
          Ringkasan Pembayaran
        </h3>
        <div className="flex justify-between items-center text-lg font-bold">
          <DollarSign className="w-5 h-5 mr-2" /> Total yang Harus Dibayar
          <span className="text-yellow-500 text-2xl">
            {formatRupiah({ price: booking.total_harga })}
          </span>
        </div>

        {/* --- Instruksi dan Peringatan --- */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 space-y-2">
          <p className="font-semibold flex items-center text-yellow-700">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Status Midtrans: Menunggu Pembayaran
          </p>
          <p className="text-sm">
            Silakan lanjutkan pembayaran melalui metode yang Anda pilih atau cek
            petunjuk di email Anda.
          </p>
        </div>

        {/* --- Tombol Aksi --- */}
        <div className="space-y-3 pt-2">
          <Button
            // Tambahkan logic untuk memicu Midtrans snap ulang
            onClick={() =>
              alert(
                "Logic untuk memicu ulang Midtrans Snap Token harus diimplementasikan di sini."
              )
            }
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            Lanjutkan Pembayaran Sekarang
          </Button>
          <Button
            onClick={() => router.push("/dashboard/riwayat-pesanan")}
            variant="outline"
            className="w-full"
          >
            Cek Status Nanti (Lihat Riwayat)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewPending;
