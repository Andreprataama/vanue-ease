// src/app/(owner)/dashboard/kelola-vanue/_components/KelolaVanueMain.tsx
import { columns, Venue } from "./colums";
import { DataTable } from "./data-table";

async function fetchVenues(): Promise<Venue[]> {
  try {
    // Menggunakan path relatif agar cookie sesi otentikasi dapat diteruskan oleh Next.js
    const response = await fetch("/api/vanue", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "Gagal mengambil data venues:",
        response.status,
        await response.text()
      );
      return [];
    }

    const result = await response.json();
    return (result.data as Venue[]) || [];
  } catch (error) {
    console.error(
      "Kesalahan jaringan atau parsing saat mengambil data venues:",
      error
    );
    return [];
  }
}

export default async function KelolaVanueMain() {
  const data = await fetchVenues();

  return (
    <div className="container mx-auto py-10 p-2">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
