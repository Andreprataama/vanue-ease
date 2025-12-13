"use client";
import ProductCard from "@/components/ProductCard";
import useSWR from "swr";
import { ApiDetailPopuler } from "@/type/venua";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const BerandaPopulerVanue = () => {
  const { data, error } = useSWR<ApiDetailPopuler>(
    "/api/vanue-populer",
    fetcher
  );

  if (error) {
    return <div>Gagal memuat data vanue.</div>;
  }

  const vanues = data?.data || [];

  if (!data) {
    return <div>Loading...</div>;
  }

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
          {vanues.map((vanue) => (
            <ProductCard key={vanue.id} ruanganData={vanue} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BerandaPopulerVanue;
