// src/app/page.tsx

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Users, ChevronRight, Tag, Home } from "lucide-react";
import { formatRupiah } from "@/utils/currency";
import { Badge } from "@/components/ui/badge";

// --- TIPE DATA DARI API ---
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

// --- FUNGSI HELPER: CARD VANUE (Sama seperti sebelumnya) ---
function VenueCard({ venue }: { venue: Venue }) {
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
        <Link href={`/vanue/${venue.id}`} legacyBehavior>
          <a className="text-sm text-primary hover:text-primary/80 font-medium flex items-center">
            Lihat Detail
            <ChevronRight className="w-4 h-4 ml-1" />
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}

async function fetchPublicVenues(): Promise<Venue[]> {
  try {
    const response = await fetch(`http://localhost:3000/api/public-vanue`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch public venues (Status):", response.status);
      const errorText = await response.text();
      console.error(
        "Failed to fetch public venues (Response Text):",
        errorText
      );
      return [];
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    // Error ini biasanya menangkap 'TypeError: Failed to parse URL' jika fetch gagal
    console.error("Network or parsing error fetching public venues:", error);
    return [];
  }
}

// --- KOMPONEN UTAMA (Homepage) ---
const HomePage = async () => {
  const venues = await fetchPublicVenues();

  return (
    <main className="container mx-auto py-12 p-5 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Temukan Vanue Terbaik untuk Acara Anda
      </h1>

      {venues.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-800">
          <Home className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl font-medium text-muted-foreground">
            Saat ini tidak ada Vanue yang tersedia.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Mohon cek kembali nanti atau daftarkan Vanue Anda!
          </p>
        </div>
      )}
    </main>
  );
};

export default HomePage;
