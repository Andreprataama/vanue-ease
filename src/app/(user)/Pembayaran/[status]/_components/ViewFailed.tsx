// src/app/Pembayaran/[status]/_components/ViewFailed.tsx

"use client";
import React from "react";
import { XCircle, RefreshCw, Info, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/utils/currency";
import { BookingApiResponseData } from "@/type/booking";

interface StatusViewProps {
  booking: BookingApiResponseData;
}

const ViewFailed: React.FC<StatusViewProps> = ({ booking }) => {
  const router = useRouter();

  return (
    <Card className="shadow-lg border-red-500/50">
      <CardHeader className="text-center">
        <XCircle className="w-16 h-16 mx-auto mb-3 text-red-500" />
        <CardTitle className="text-3xl text-red-600">
          Pembayaran Gagal
        </CardTitle>
        <p className="text-muted-foreground mt-2">
          Transaksi Anda gagal diproses. Pesanan ini dibatalkan.
        </p>
        <p className="text-sm font-semibold mt-4">
          Kode Booking:{" "}
          <span className="text-primary">{booking.kode_unik}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* --- Detail Pembayaran yang Gagal --- */}
        <h3 className="text-xl font-bold border-b pb-2 text-red-600">
          Ringkasan Transaksi
        </h3>
        <div className="flex justify-between items-center text-lg font-bold">
          <DollarSign className="w-5 h-5 mr-2" /> Jumlah Transaksi
          <span className="text-red-500 text-2xl">
            {formatRupiah({ price: booking.total_harga })}
          </span>
        </div>

        {/* --- Pesan Kegagalan dan Aksi --- */}
        <div className="bg-red-50 border-l-4 border-red-400 p-4 space-y-2">
          <p className="font-semibold flex items-center text-red-700">
            <Info className="w-5 h-5 mr-2" />
            Transaksi dibatalkan. Dana tidak dipotong (jika ada).
          </p>
          <p className="text-sm">
            Mohon ulangi proses pemesanan dari halaman detail venue.
          </p>
        </div>

        <div className="pt-2">
          <Button
            // Asumsi routing kembali ke halaman detail venue
            onClick={() => router.push(`/Tempat/${booking.venue.nama_ruangan}`)}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Ulangi Pemesanan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewFailed;
