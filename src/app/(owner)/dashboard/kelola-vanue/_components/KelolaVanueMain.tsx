import { columns, Venue } from "./colums";
import { DataTable } from "./data-table";
import { cookies } from "next/headers";

async function fetchVenues(): Promise<Venue[]> {
  console.log("[STATUS] Memulai proses fetchVenues...");
  try {
    const url = "/api/vanue";

    // 1. Ambil objek CookiesStore
    const cookieStore = cookies();

    // 2. Gunakan .getAll() untuk mendapatkan array of cookie objects.
    const allCookies = cookieStore.getAll();

    // 3. Buat string header 'Cookie' yang lengkap secara manual: "name1=value1; name2=value2"
    const cookieHeader = allCookies
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    console.log(
      `[DEBUG] Jumlah total cookie yang ditemukan: ${allCookies.length}`
    );
    console.log(
      `[DEBUG] Header 'Cookie' yang Dibuat: ${cookieHeader.substring(0, 100)}${
        cookieHeader.length > 100 ? "..." : ""
      }`
    );
    // ------------------------------------

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const headersConfig: HeadersInit = {
      "cache-control": "no-store",
    };

    // Hanya tambahkan header 'cookie' jika string tidak kosong
    if (cookieHeader) {
      headersConfig.cookie = cookieHeader;
    }

    const response = await fetch(`${baseUrl}${url}`, {
      method: "GET",
      // Teruskan headers yang sudah dimodifikasi (termasuk cookie sesi)
      headers: headersConfig,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      // LOG ERROR JELAS
      console.error(
        `[ERROR] Gagal mengambil data venues: ${response.status} ${errorText}`
      );
      return [];
    }

    const result = await response.json();

    console.log(
      `[SUCCESS] Berhasil mengambil ${
        result.data ? result.data.length : 0
      } venues.`
    );

    return (result.data as Venue[]) || [];
  } catch (error) {
    console.error(
      "[FATAL ERROR] Kesalahan jaringan atau parsing saat mengambil data venues:",
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
