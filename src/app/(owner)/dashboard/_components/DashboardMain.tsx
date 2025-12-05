"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Home, Users, Tag, Loader2 } from "lucide-react";
import { formatRupiah } from "@/utils/currency";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface Venue {
  id: number;
  nama_ruangan: string;
  tipe_sewa: "perhari" | "perjam" | null;
  harga_per_jam: number | null;
  harga_per_hari: number | null;
  kapasitas_maks: number | null;
  images: { image_url: string }[];
  venueCategories: { category: { nama_kategori: string } }[];
}

// --- KOMPONEN CARD VANUE (Product Card) ---
function VenueCard({ venue }: { venue: Venue }) {
  // Logika tampilan card tetap sama
  const imageUrl = venue.images[0]?.image_url || "/assets/default_venue.jpg";
  const categoryName =
    venue.venueCategories[0]?.category.nama_kategori || "Tidak Dikategorikan";
  const price =
    venue.tipe_sewa === "perjam" ? venue.harga_per_jam : venue.harga_per_hari;
  const priceUnit = venue.tipe_sewa === "perjam" ? "Jam" : "Hari";

  const formattedPrice = price
    ? formatRupiah({ price: Number(price) })
    : "Harga Tidak Tersedia";

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg w-full">
      <div className="relative w-full aspect-3/2 bg-gray-200 dark:bg-gray-700">
        <img
          src={imageUrl}
          alt={`Foto utama ${venue.nama_ruangan}`}
          className="object-cover w-full h-full"
          style={{ maxHeight: "100%", objectFit: "cover" }}
        />

        <Badge className="absolute top-2 left-2 bg-yellow-400 text-black">
          <Tag className="w-3 h-3 mr-1" />
          {categoryName}
        </Badge>
      </div>
      <CardHeader className="p-4 flex flex-col gap-2">
        <CardTitle className="text-lg truncate">{venue.nama_ruangan}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="w-4 h-4 mr-2" />
          Kapasitas Maks: {venue.kapasitas_maks || "-"}
        </div>
      </CardHeader>
      <CardContent className="px-4 py-0">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold text-foreground">
            {formattedPrice}
          </div>
          {price && (
            <div className="text-sm text-muted-foreground">/ {priceUnit}</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <Link href={`/dashboard/kelola-vanue/edit/${venue.id}`}></Link>
      </CardFooter>
    </Card>
  );
}

const DashboardMain = () => {
  // State untuk menyimpan data venue
  const [venues, setVenues] = useState<Venue[]>([]);
  // State untuk mengelola loading
  const [isLoading, setIsLoading] = useState(true);
  // State untuk mengelola error (opsional)
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk melakukan fetching data
  const fetchVenues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/vanue", {
        method: "GET",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch venues:", response.status, errorText);
        // Tampilkan pesan error jika API gagal
        setError("Gagal memuat data Vanue. Silakan coba lagi.");
        setVenues([]);
        return;
      }

      const result = await response.json();

      // Pastikan format respons API Anda adalah { data: [...] }
      if (result && Array.isArray(result.data)) {
        setVenues(result.data);
      } else {
        // Jika respons valid tapi formatnya aneh
        console.warn("API response format unexpected:", result);
        setVenues([]);
      }
    } catch (err) {
      console.error("Network or parsing error fetching venues:", err);
      setError("Terjadi kesalahan jaringan.");
      setVenues([]);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect untuk memicu fetching saat komponen pertama kali dimuat
  useEffect(() => {
    fetchVenues();
  }, []); // Array kosong memastikan hanya berjalan sekali saat mount

  // --- RENDERING TAMPILAN DASHBOARD ---

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 p-5 text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Memuat data Vanue...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 p-5 text-center text-red-500">
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 p-5">
      <h1 className="text-2xl font-bold mb-6">Overview Vanue Anda</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Contoh Stat Card */}
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Vanue</p>
          <div className="text-3xl font-bold">{venues.length}</div>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">
        Daftar Vanue ({venues.length})
      </h2>

      {venues.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-800">
          <Home className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-lg font-medium text-muted-foreground">
            Belum ada Vanue yang terdaftar.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Ayo{" "}
            <Link
              href="/dashboard/kelola-vanue/tambah-vanue"
              className="text-blue-500 hover:underline"
            >
              tambahkan Vanue
            </Link>{" "}
            pertama Anda!
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardMain;
