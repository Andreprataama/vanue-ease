"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Home } from "lucide-react";
import Link from "next/link";
import { columns } from "./colums";
import { VenueDataTable } from "./data-table";
import { Booking } from "../../_components/DashboardMain";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import ProductCardDashboard from "@/components/ProductCardDashboard";

interface Venue {
  id: number;
  nama_ruangan: string;
  tipe_sewa: "perjam" | "perhari";
  harga_per_jam: string | null; // Sesuaikan dengan data API
  harga_per_hari: string | null; // Sesuaikan dengan data API
  category?: string; // Tipe ini mungkin tidak diperlukan lagi jika menggunakan venueCategories
  kapasitas_maks: number;
  deskripsi_venue?: string; // Tambahkan '?' jika ini tidak selalu ada
  alamat_venue?: string; // Tambahkan '?'
  fasilitas_kustom?: string; // Tambahkan '?'
  peraturan_venue?: string; // Tambahkan '?'
  bookings: Booking[]; // Sesuaikan dengan tipe Booking Anda
  is_published: boolean;
  images: { image_url: string; sort_order?: number; is_primary?: boolean }[];
  status_venue: "ACTIVE" | "PENDING" | "BLOCKED";

  venueCategories: VenueCategory[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const KelolaVenueMain = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<number | null>(null);

  const fetchVenues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/vanue", { method: "GET" });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Gagal memuat data Vanue.");
      }

      const result = await response.json();

      if (Array.isArray(result.data)) {
        setVenues(result.data as Venue[]); // Type assertion
      } else {
        setVenues([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Terjadi kesalahan saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenConfirm = (venueId: number) => {
    setVenueToDelete(venueId);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (venueToDelete === null) return;

    setIsConfirmOpen(false);
    toast.loading("Menghapus Vanue...", { id: "delete-venue" });

    try {
      const response = await fetch(`/api/vanue/${venueToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Coba ambil pesan error dari respons jika ada
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Gagal menghapus venue di server."
        );
      }

      toast.success("Vanue berhasil dihapus!", { id: "delete-venue" });
      fetchVenues();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error deleting venue:", error);
      toast.error(error.message || "Terjadi kesalahan saat menghapus Vanue.", {
        id: "delete-venue",
      });
    } finally {
      setVenueToDelete(null);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  // --- Perhitungan Statistik ---
  const totalVenues = venues.length;
  const activeVenues = venues.filter((v) => v.status_venue === "ACTIVE").length;
  const pendingVenues = venues.filter(
    (v) => v.status_venue === "PENDING"
  ).length;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 p-5 text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-yellow-500" />
        <p className="mt-2 text-muted-foreground">Memuat data Vanue...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 p-5 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header className="flex justify-between items-center ">
        <h1 className="text-3xl font-extrabold text-gray-800">
          Kelola Tempat Anda
        </h1>
        <Link href="/dashboard/kelola-vanue/tambah-vanue" passHref>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Buat Vanue Baru
          </Button>
        </Link>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Vanue"
          value={totalVenues}
          icon={<Home className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* --- Bagian Tabel Data --- */}
      <div className="bg-white p-6 rounded-xl shadow-xl border">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Daftar Vanue
        </h2>
        <VenueDataTable
          columns={columns}
          data={venues}
          meta={{
            onDelete: handleOpenConfirm,
          }}
        />
      </div>

      {/* --- Tampilan Vanue Anda --- */}
      <div className="w-full border bg-white rounded-xl p-6 shadow-xl space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center border-b pb-3">
          <Home className="w-5 h-5 mr-3" />
          Pratinjau Venue Anda
        </h2>

        {venues.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {venues.map((vanue) => (
              <ProductCardDashboard key={vanue.id} ruanganData={vanue} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 font-medium">
              Belum ada Venue yang terdaftar untuk ditampilkan.
            </p>
          </div>
        )}
      </div>

      {/* --- AlertDialog (Konfirmasi Hapus) --- */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Konfirmasi Penghapusan
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus Vanue ini? Tindakan ini tidak
              dapat dibatalkan dan data Vanue, termasuk semua gambar dan relasi,
              akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirmed}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Ya, Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KelolaVenueMain;
