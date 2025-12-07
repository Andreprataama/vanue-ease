"use client";

import Image from "next/image";
import useSWR from "swr";
import {
  MapPin,
  User,
  AirVent,
  Users,
  Mic,
  Car,
  Monitor,
  Toilet,
  Wifi,
  ClipboardList,
} from "lucide-react";

interface TempatDetailMainProps {
  id: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const TempatDetail = ({ id }: TempatDetailMainProps) => {
  const { data, error } = useSWR(
    `http://localhost:3000/api/public-vanue/${id}`,
    fetcher
  );

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  return (
    <div>
      <div className=" p-12 min-h-screen">
        {/* --- Header --- */}
        <div className="relative h-[400px] w-full bg-black rounded-2xl overflow-hidden mb-8">
          <Image
            src={data.data.images.image_url || "/placeholder-image.png"}
            alt="Tempat Image"
            layout="fill"
            objectFit="cover"
            className="opacity-70 rounded-2xl overflow-hidden"
          />
          <div className="absolute inset-0  from-black/80 to-transparent p-10 flex flex-col justify-end">
            <p className="text-white/80 text-lg font-medium mb-2">
              {/* Kategori pertama */}
              {data?.data?.venueCategories?.[0]?.category?.nama_kategori ||
                "Tidak Dikategorikan"}
            </p>
            <h1 className="text-white text-5xl font-extrabold">
              {data.data.nama_ruangan}
            </h1>
            <div className="flex items-center text-white/90 mt-4">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{data.data.alamat_venue || "Lokasi tidak tersedia."}</span>
            </div>
          </div>
        </div>

        {/* --- Konten Utama (Dua Kolom) --- */}
        <div className="flex flex-row gap-6 mb-8">
          {/* KOLOM KIRI: DETAIL */}
          <div className="flex flex-col gap-6 p-8 w-3/4  shadow-xl rounded-2xl ">
            {/* Lokasi */}
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 " />
              <span>{data.data.alamat_venue || "Lokasi tidak tersedia."}</span>
            </div>
            {/* Kapasitas */}
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              <span>1 - {data.data.kapasitas_maks} Orang</span>
            </div>

            {/* Tentang Tempat */}
            <div className="space-y-4">
              <h1 className="font-bold text-2xl">Tentang Tempat</h1>
              <p className="text-md w-[90%] leading-relaxed font-medium text-justify">
                {data.data.deskripsi_venue ||
                  "Deskripsi tidak tersedia untuk tempat ini."}
              </p>
            </div>

            {/* Fasilitas */}
            <div className="space-y-6 w-full">
              <h1 className="font-bold text-2xl">Fasilitas</h1>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>
            </div>

            {/* Galeri */}
            <div>
              <h1 className="font-bold text-2xl w-full mb-5">Galeri</h1>
              <div className="mt-5 flex gap-4 overflow-x-scroll snap-x snap-mandatory pb-4"></div>
            </div>
          </div>

          {/* KOLOM KANAN: BOOKING */}
          <div className="w-1/4  flex justify-center items-center shadow-xl rounded-2xl p-6 bg-white">
            <h1 className="text-xl font-semibold text-gray-700">
              Components Input Booking
            </h1>
          </div>
        </div>

        <div className="w-full h-64 bg-white border-t pt-8">
          <h2 className="font-bold text-xl mb-4">Tempat Lainnya</h2>
          Another Place Placeholder
        </div>
      </div>
    </div>
  );
};

export default TempatDetail;
