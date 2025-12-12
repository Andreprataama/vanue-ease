"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { columns } from "./colums";
import { VenueDataTable } from "./data-table";
import { Venue } from "@/type/venua";
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
import { toast } from "sonner";

const KelolaVenueMain = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk konfirmasi penghapusan
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
        setVenues(result.data);
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

  // 1. Handler yang membuka modal konfirmasi
  const handleOpenConfirm = async (venueId: number) => {
    setVenueToDelete(venueId);
    setIsConfirmOpen(true);
  };

  // 2. Handler yang dipanggil setelah konfirmasi
  const handleDeleteConfirmed = async () => {
    if (venueToDelete === null) return;

    setIsConfirmOpen(false); // Tutup modal

    try {
      // Memanggil API DELETE dengan ID Vanue
      const response = await fetch(`/api/vanue/${venueToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus venue di server.");
      }

      // Jika berhasil, tampilkan pesan dan muat ulang data
      toast.success("Vanue berhasil dihapus!");
      fetchVenues();
    } catch (error) {
      console.error("Error deleting venue:", error);
      alert("Gagal menghapus Vanue.");
    } finally {
      setVenueToDelete(null);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []); // Hanya berjalan sekali saat mount

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
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kelola Vanue</h1>
        <Link href="/dashboard/kelola-vanue/tambah-vanue" passHref>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Vanue
          </Button>
        </Link>
      </div>

      <VenueDataTable
        columns={columns}
        data={venues}
        meta={{
          onDelete: handleOpenConfirm,
        }}
      />

      {/* Komponen AlertDialog untuk Konfirmasi */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
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
              className="bg-destructive hover:bg-destructive/90"
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
