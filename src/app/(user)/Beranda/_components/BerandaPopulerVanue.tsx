import ProductCard from "@/components/ProductCard";
import { Venue } from "@/type/venua";
import prisma from "@/utils/prisma";

async function fetchAllVanues(): Promise<Venue[]> {
  try {
    const venues = await prisma.venue.findMany({
      select: {
        id: true,
        nama_ruangan: true,
        tipe_sewa: true,
        harga_per_jam: true,
        harga_per_hari: true,
        kapasitas_maks: true,
        alamat_venue: true,
        images: {
          where: { is_primary: true },
          select: { image_url: true },
        },
        venueFacilities: {
          select: {
            facility: { select: { facility_id: true, nama_fasilitas: true } },
          },
        },
        deskripsi_venue: true,
        venueCategories: {
          select: {
            category: { select: { category_id: true, nama_kategori: true } },
          },
          take: 1,
        },
      },
    });

    return venues as Venue[];
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
