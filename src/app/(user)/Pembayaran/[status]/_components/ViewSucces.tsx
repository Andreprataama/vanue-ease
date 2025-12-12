// src/app/Pembayaran/[status]/_components/ViewSucces.tsx

"use client";
import React from "react";
import { CheckCircle, DollarSign, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/utils/currency";
import { BookingApiResponseData } from "@/type/booking"; // Pastikan impor tipe data

interface StatusViewProps {
  booking: BookingApiResponseData;
  // Anda bisa menambahkan status: string jika ingin membedakan antara pending/onclose
}

const ViewSucces: React.FC<StatusViewProps> = ({ booking }) => {
  const router = useRouter();

  return (
    <Card className="shadow-lg border-green-500/50">
      <CardHeader className="text-center">
        <CheckCircle className="w-16 h-16 mx-auto mb-3 text-green-500" />
        <CardTitle className="text-3xl text-green-600">
          Pembayaran Berhasil!
        </CardTitle>
        <p className="text-muted-foreground mt-2">
          Booking Anda telah dikonfirmasi dan lunas.
        </p>
        <p className="text-sm font-semibold mt-4">
          Kode Booking:{" "}
          <span className="text-primary">{booking.kode_unik}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* --- Detail Booking (Dipotong untuk konsistensi) --- */}
        <h3 className="text-xl font-bold border-b pb-2">Rincian Pembayaran</h3>
        <div className="flex justify-between items-center text-lg font-bold">
          <DollarSign className="w-5 h-5 mr-2" /> Total Dibayar
          <span className="text-green-500">
            {formatRupiah({ price: booking.total_harga })}
          </span>
        </div>
        {/* --- Tombol Aksi --- */}
        <Button
          onClick={() => router.push("/dashboard/riwayat-pesanan")}
          className="w-full bg-green-600 hover:bg-green-700 mt-4"
        >
          Lihat Bukti Transaksi
        </Button>
      </CardContent>
    </Card>
  );
};

export default ViewSucces;
