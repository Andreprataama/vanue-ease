import ProductCard from "@/components/ProductCard";
import { Venue, ApiResponse } from "@/type/venua";

async function fetchAllVanues(): Promise<Venue[]> {
  try {
    const apiUrl = "http://localhost:3000/api/public-vanue";

    const response = await fetch(apiUrl, { cache: "no-store" });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return [];
    }

    const apiResponse: ApiResponse = await response.json();

    return apiResponse.data || [];
  } catch (error) {
    console.error("Error fetching all vanues:", error);
    return [];
  }
}

const BerandaPopulerVanue = async () => {
  const allVanues = await fetchAllVanues();

  return (
    <section className="h-full p-10">
      <div className="w-full bg-black rounded-xl p-6 ml-2">
        <h1 className="text-white text-2xl font-extrabold">
          Semua Daftar Vanue Populer
        </h1>
        <p className="text-sm  text-white/70 max-w-md mt-2">
          Lihatlah tempat-tempat pilihan yang bedasarkan lokasi anda dan tempat
          terbaik dari penyewa kami.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-10">
          {allVanues.map((vanue) => (
            <ProductCard key={vanue.id} ruanganData={vanue} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BerandaPopulerVanue;
