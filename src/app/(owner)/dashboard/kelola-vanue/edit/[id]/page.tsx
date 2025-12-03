// FILE: app/(owner)/dashboard/kelola-vanue/edit/[id]/page.tsx
"use client"; // Ini adalah Client Component karena menggunakan hooks React dan Next.js Navigation

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // Untuk mengambil ID dan navigasi
import { Loader2 } from "lucide-react";

// Asumsi form Anda (VenueForm) dan tipe data (Venue, VenueFormData)
// harus di-import dari lokasi yang sesuai.
import { VenueForm } from "@/components/VanueForm";
import { Venue, VenueFormData } from "@/type/venua";

const EditVenuePage = () => {
  const params = useParams();
  const router = useRouter();
  // Ambil ID dari path URL, pastikan itu string
  const venueId = params.id as string;

  const [defaultData, setDefaultData] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 1. FETCHING DATA DEFAULT (Menggunakan API GET) ---
  useEffect(() => {
    if (!venueId) return;

    const fetchVenueData = async () => {
      setIsLoading(true);
      try {
        // Panggil API GET detail yang sudah kita buat
        const response = await fetch(`/api/vanue/${venueId}`);

        if (!response.ok) {
          // Jika API mengembalikan 404/401, lempar error
          throw new Error(
            "Gagal mengambil data venue detail atau tidak memiliki izin."
          );
        }

        const result = await response.json();

        // Asumsi data yang diterima sudah diflattening dan dikonversi
        // (misalnya harga dari Decimal ke Number) di backend.
        setDefaultData(result.data);
      } catch (err) {
        console.error("Fetch detail error:", err);
        setError("Data venue tidak dapat dimuat atau tidak ditemukan.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenueData();
  }, [venueId]);

  const handleUpdate = async (data: VenueFormData) => {
    try {
      const response = await fetch(`/api/vanue/${venueId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // Cek apakah response sukses (Status 200-299)
      if (!response.ok) {
        // --- LOGIKA PERBAIKAN DIMULAI DI SINI ---

        // 1. Dapatkan teks respons (ini tidak akan gagal walaupun kosong)
        const responseText = await response.text();

        let errorMessage = `Gagal menyimpan perubahan. Status: ${response.status}.`;

        // 2. Coba parse JSON hanya jika ada teks
        if (responseText.length > 0) {
          try {
            const errorBody = JSON.parse(responseText); // Coba parse
            // Asumsikan pesan error ada di errorBody.message
            errorMessage = errorBody.message || errorMessage;
          } catch (e) {
            errorMessage = `Server Error: ${responseText.substring(0, 100)}...`;
          }
        }

        // Lempar error untuk ditangkap di blok catch
        throw new Error(errorMessage);
      }

      // Jika respons 2xx, dan berhasil
      alert("Venue berhasil diperbarui!");
      // router.push('/dashboard/kelola-vanue');
    } catch (err: any) {
      console.error("Update error:", err);
      // Tampilkan pesan error yang sudah diolah
      alert(`Terjadi kesalahan saat menyimpan data: ${err.message}`);
    }
  };

  // --- RENDERING KONDISIONAL ---

  // Status Loading
  if (isLoading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
        <p className="mt-2 text-gray-600">Memuat data venue...</p>
      </div>
    );
  }

  // Status Error atau Data Tidak Ditemukan
  if (error || !defaultData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-red-600">Error!</h2>
        <p className="mt-2">{error || "Data Venue tidak ditemukan."}</p>
        <button
          onClick={() => router.push("/dashboard/kelola-vanue")}
          className="mt-4 text-blue-500 hover:underline"
        >
          Kembali ke Daftar Vanue
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Ubah Detail Vanue: {defaultData.nama_ruangan}
      </h1>

      <VenueForm
        defaultValues={defaultData as any}
        onSubmit={handleUpdate}
        isEditing={true}
      />
    </div>
  );
};

export default EditVenuePage;
