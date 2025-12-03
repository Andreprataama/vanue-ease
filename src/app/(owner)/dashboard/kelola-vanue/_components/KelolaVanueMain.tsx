// FILE: app/dashboard/kelola-vanue/KelolaVenueMain.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { columns } from "./colums"; // Path ke kolom
import { VenueDataTable } from "./data-table"; // Path ke DataTable
import { Venue } from "@/type/venua"; // Import interface

const KelolaVenueMain = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVenues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Mengambil data, cookies akan otomatis disertakan oleh browser
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

  const handleDelete = async (venueId: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus Vanue ini?")) {
      return;
    }

    try {
      // Memanggil API DELETE dengan ID Vanue
      const response = await fetch(`/api/vanue/${venueId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus venue di server.");
      }

      // Jika berhasil, tampilkan pesan dan muat ulang data
      alert("Vanue berhasil dihapus!");
      fetchVenues();
    } catch (error) {
      console.error("Error deleting venue:", error);
      alert("Gagal menghapus Vanue.");
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []); // Hanya berjalan sekali saat mount

  // --- KONDISI RENDERING ---

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
          onDelete: handleDelete, // Meneruskan handler delete ke tabel
        }}
      />
    </div>
  );
};

export default KelolaVenueMain;
