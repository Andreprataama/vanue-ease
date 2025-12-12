"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { formatRupiah } from "@/utils/currency";
import useSWR, { Fetcher } from "swr";
import { Loader2, CalendarIcon, Clock, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { VenueDetail, ApiDetailResponse } from "@/type/venua";

interface CheckoutMainProps {
  venueId: string;
}

interface BookingDetails {
  date: string;
  time: string;
  guests: number;
  duration: number | null;
  tipeSewa: "perjam" | "perhari";
}

const parseBookingDetails = (params: {
  [key: string]: string | string[] | undefined;
}): BookingDetails | null => {
  const getStringParam = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const date = getStringParam("date");
  const time = getStringParam("time");
  const guestsInput = getStringParam("guests");
  const tipe = getStringParam("tipe");
  const durationInput = getStringParam("duration");

  if (!date || !time || !guestsInput || !tipe) {
    return null;
  }

  const guests = parseInt(guestsInput, 10);
  const duration = durationInput ? parseInt(durationInput, 10) : null;

  if (isNaN(guests) || guests <= 0) {
    return null;
  }

  if (tipe !== "perjam" && tipe !== "perhari") {
    return null;
  }

  if (
    tipe === "perjam" &&
    (duration === null || isNaN(duration) || duration <= 0)
  ) {
    return null;
  }

  return {
    date,
    time,
    guests,
    duration,
    tipeSewa: tipe as "perjam" | "perhari",
  };
};

const fetcher: Fetcher<ApiDetailResponse> = (url: string) =>
  fetch(url).then((res) => res.json());

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess: () => void;
          onPending: (result: any) => void;
          onError: (result: any) => void;
          onClose: () => void;
        }
      ) => void;
    };
  }
}

const contactFormSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi."),
  email: z.string().email("Format email tidak valid."),
  phone: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit.")
    .max(15, "Nomor telepon maksimal 15 digit."),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const CheckoutMain = ({ venueId }: CheckoutMainProps) => {
  const router = useRouter();
  const rawSearchParams = useSearchParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const numericVenueId = parseInt(venueId, 10);

  const searchParams = useMemo(() => {
    const params: { [key: string]: string | string[] | undefined } = {};
    rawSearchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [rawSearchParams]);

  const bookingDetails = useMemo(
    () => parseBookingDetails(searchParams),
    [searchParams]
  );

  const isIdValid = venueId && venueId !== "undefined";
  const swrKey = isIdValid ? `/api/public-vanue/${venueId}` : null;

  const { data: venueData, error: venueError } = useSWR<ApiDetailResponse>(
    swrKey,
    fetcher
  );

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  if (venueError) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl text-red-500">Gagal memuat detail Venue.</h1>
        <Button
          onClick={() => router.push(`/Tempat/${venueId}`)}
          className="mt-4"
        >
          Kembali ke Detail Tempat
        </Button>
      </div>
    );
  }

  if (!isIdValid) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl text-red-500">ID Venue tidak valid.</h1>
        <p className="text-muted-foreground">
          ID tempat tidak ditemukan di URL.
        </p>
        <Button onClick={() => router.push(`/Tempat/`)} className="mt-4">
          Kembali ke Halaman Tempat
        </Button>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl text-red-500">
          Data pemesanan hilang atau tidak valid.
        </h1>
        <p className="text-muted-foreground">
          Mohon kembali ke halaman detail dan ulangi pemesanan.
        </p>
        <Button
          onClick={() => router.push(`/Tempat/${venueId}`)}
          className="mt-4"
        >
          Kembali ke Detail Tempat
        </Button>
      </div>
    );
  }

  if (!venueData || !venueData.data) {
    return (
      <div className="container mx-auto py-20 text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
        <p className="mt-2 text-gray-600">Memuat rincian tempat...</p>
      </div>
    );
  }

  const venue = venueData.data as VenueDetail;

  const pricePerUnit =
    venue.tipe_sewa === "perjam"
      ? Number(venue.harga_per_jam)
      : Number(venue.harga_per_hari);

  const qty =
    bookingDetails.tipeSewa === "perjam" ? bookingDetails.duration : 1;
  const finalPrice = pricePerUnit * (qty || 1);

  const unitDisplay =
    bookingDetails.tipeSewa === "perjam" ? `${qty} Jam` : `1 Hari`;

  const biayaAdmin = 10000;
  const totalHarga = finalPrice + biayaAdmin;

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        venueId: numericVenueId,
        tanggal_mulai: bookingDetails.date,
        jam_mulai: bookingDetails.time,
        durasi: bookingDetails.duration,
        jumlah_tamu: bookingDetails.guests,
        nama_pemesan: values.name,
        email_pemesan: values.email,
        telepon_pemesan: values.phone,
      };

      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.snapToken) {
        const backendError =
          result.errors?.body?.[0]?.message || result.message;
        throw new Error(backendError || "Gagal memproses pembayaran.");
      }

      const snapToken = result.snapToken;

      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: () => {
            toast.success(
              "Pembayaran berhasil! Cek email Anda untuk detail pesanan."
            );
            router.push("/dashboard/riwayat-pesanan");
          },
          onPending: () => {
            toast.warning("Pembayaran tertunda. Selesaikan pembayaran Anda.");
            router.push("/dashboard/riwayat-pesanan");
          },
          onError: () => {
            toast.error("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: () => {
            toast.info(
              "Anda menutup jendela pembayaran. Status pesanan Anda 'Pending Payment'."
            );
            router.push("/dashboard/riwayat-pesanan");
          },
        });
      } else {
        toast.error("Midtrans Snap belum dimuat dengan benar.");
      }
    } catch (error: any) {
      console.error("Final Booking Error:", error);
      toast.error(
        error.message ||
          "Terjadi kesalahan server saat menyelesaikan pemesanan."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const BookingRecap = () => (
    <Card className="h-full bg-gray-50 border-gray-200 p-4">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-xl">Ringkasan Pemesanan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        <div className="pb-3 border-b">
          <p className="text-lg font-bold">{venue.nama_ruangan}</p>
          <p className="text-sm text-muted-foreground">{venue.alamat_venue}</p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-muted-foreground">
              <CalendarIcon className="w-4 h-4 mr-2" /> Tanggal
            </div>
            <span className="font-semibold">{bookingDetails.date}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center text-muted-foreground">
              <Clock className="w-4 h-4 mr-2" /> Waktu Mulai
            </div>
            <span className="font-semibold">{bookingDetails.time}</span>
          </div>
          {bookingDetails.tipeSewa === "perjam" && (
            <div className="flex justify-between items-center">
              <div className="flex items-center text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" /> Durasi
              </div>
              <span className="font-semibold">
                {bookingDetails.duration} Jam
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <div className="flex items-center text-muted-foreground">
              <Users className="w-4 h-4 mr-2" /> Jumlah Tamu
            </div>
            <span className="font-semibold">{bookingDetails.guests} Orang</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-md">
            <span>
              Harga ({unitDisplay} x {formatRupiah({ price: pricePerUnit })})
            </span>
            <span className="text-primary">
              {formatRupiah({ price: finalPrice })}
            </span>
          </div>
          <div className="flex justify-between items-center text-md ">
            <span>Biaya Layanan {formatRupiah({ price: biayaAdmin })})</span>
            <span className="text-primary">
              {formatRupiah({ price: biayaAdmin })}
            </span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-md font-semibold">
            <span>Total yang harus dibayar</span>
            <span className="text-yellow-400">
              {formatRupiah({ price: totalHarga })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // --- Komponen Form Kontak (Right Side) ---
  const ContactForm = () => (
    <Card className="h-full p-4">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-2xl">Lengkapi Data Kontak</CardTitle>
        <CardDescription>
          Detail ini akan digunakan untuk konfirmasi pemesanan dan pembayaran.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Field Nama */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Nama Anda"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Field Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="email@contoh.com"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Field Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input
              id="phone"
              type="tel"
              {...form.register("phone")}
              placeholder="Cth: 081234567890"
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-500">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-black hover:bg-gray-800"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              `Bayar Sekarang (${formatRupiah({ price: totalHarga })})`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-20 ">
      <h1 className="text-3xl text-center font-bold mb-8">
        Langkah 2: Konfirmasi & Pembayaran
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kanan: Form Kontak & Bayar */}
        <div className="lg:col-span-2">
          <ContactForm />
        </div>
        {/* Kolom Kiri: Ringkasan */}
        <div className="lg:col-span-1">
          <BookingRecap />
        </div>
      </div>
    </div>
  );
};

export default CheckoutMain;
