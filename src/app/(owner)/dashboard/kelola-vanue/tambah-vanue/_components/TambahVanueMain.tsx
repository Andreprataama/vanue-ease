// src/app/(owner)/dashboard/kelola-vanue/_components/KelolaVanueMain.tsx
"use server"; // Pastikan ini adalah Server Component

import { columns, Venue } from "./colums";
import { DataTable } from "./data-table";
import { cookies } from "next/headers"; // <-- Import yang diperlukan

async function fetchVenues(): Promise<Venue[]> {
  // FIX: Ganti logic cookie retrieval untuk menghindari .getAll()
  const cookieStore = cookies();

  // Coba ambil cookie 'session' (nama umum better-auth) atau '__session'
  const sessionCookie =
    cookieStore.get("session") || cookieStore.get("__session");

  let cookieHeader = "";
  if (sessionCookie) {
    cookieHeader = `${sessionCookie.name}=${sessionCookie.value}`;
  }
  // END FIX

  try {
    // Menggunakan path absolut agar cookie sesi otentikasi dapat diteruskan oleh Next.js
    const response = await fetch("http://localhost:3000/api/vanue", {
      method: "GET",
      cache: "no-store",
      headers: {
        Cookie: cookieHeader, // <-- Kirim cookie secara eksplisit
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gagal mengambil data venues:", response.status, errorText);
      return [];
    }

    const result = await response.json();

    // --- DEBUGGING LOG ---
    console.log(
      `[DEBUG] Jumlah Venue yang ditemukan: ${
        result.data ? result.data.length : 0
      }`
    );
    // ---------------------

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
