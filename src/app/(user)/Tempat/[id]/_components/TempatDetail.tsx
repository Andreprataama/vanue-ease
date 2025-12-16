"use client";

import Image from "next/image";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
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
  HelpCircle,
} from "lucide-react";
import VenueBookingForm from "./VanueBookingForm";

interface TempatDetailMainProps {
  id: string;
}

const facilityIconMap: { [key: string]: React.ElementType } = {
  AC: AirVent,
  Toilet: Toilet,
  "Parkir Luas": Car,
  Wifi: Wifi,
  "Sound System": Mic,
  Proyektor: Monitor,
  "Meja & Kursi": ClipboardList,
  "Akses Kursi Roda": Users,
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const TempatDetail = ({ id }: TempatDetailMainProps) => {
  const { data, error } = useSWR(`/api/public-vanue/${id}`, fetcher);

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-red-600">
        Vanue tidak ditemukan. (ID: {id})
      </div>
    );
  }

  if (!data || !data.data) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-500"></div>
    );
  }

  const venue = data.data;

  const {
    nama_ruangan,
    alamat_venue,
    kapasitas_maks,
    deskripsi_venue,
    images = [],
    tipe_sewa,
    harga_per_jam,
    harga_per_hari,
    venueCategories = [],
    venueFacilities = [],
  } = venue;

  const mainImageUrl = images?.[0]?.image_url || "/placeholder-image.png";
  const galleryImages = images || [];

  const hargaString = tipe_sewa === "perhari" ? harga_per_hari : harga_per_jam;
  const hargaNumber = hargaString ? parseInt(hargaString) : null;

  const facilityNames =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    venueFacilities.map((item: any) => item.facility.nama_fasilitas) || [];

  return (
    <div>
      <div className="p-6 md:p-12 min-h-screen">
        <div className="relative h-[400px] w-full bg-black rounded-2xl overflow-hidden mb-8">
          <Image
            src={mainImageUrl}
            alt="Tempat Image"
            layout="fill"
            objectFit="cover"
            priority
            className="opacity-80 rounded-2xl overflow-hidden"
          />
          <div className="absolute inset-0  from-black/80 to-transparent p-5 md:p-10 flex flex-col justify-end">
            <p className="text-white text-lg font-bold mb-2 ">
              {venueCategories?.[0]?.category?.nama_kategori ||
                "Tidak Dikategorikan"}
            </p>
            <h1 className="text-white text-2xl md:text-5xl font-extrabold">
              {nama_ruangan}
            </h1>
            <div className="flex items-center text-white/90 mt-4">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{alamat_venue || "Lokasi tidak tersedia."}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex md:flex-row gap-6 mb-8 ">
          <div className="flex flex-col gap-6 p-8 w-full md:w-3/4  shadow-md rounded-2xl border ">
            {/* Lokasi */}
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 " />
              <span>{alamat_venue || "Lokasi tidak tersedia."}</span>
            </div>
            {/* Kapasitas */}
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              <span>1 - {kapasitas_maks} Orang</span>
            </div>

            {/* Tentang Tempat */}
            <div className="space-y-4">
              <h1 className="font-bold text-2xl">Tentang Tempat</h1>
              <p className="text-md w-[90%] leading-relaxed font-medium text-justify">
                {deskripsi_venue ||
                  "Deskripsi tidak tersedia untuk tempat ini."}
              </p>
            </div>

            {/* Fasilitas */}
            <div className="space-y-6 w-full">
              <h1 className="font-bold text-2xl">Fasilitas</h1>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {facilityNames.length > 0 ? (
                  facilityNames.map((name: string, index: number) => {
                    const IconComponent = facilityIconMap[name] || HelpCircle;
                    return (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-gray-700"
                      >
                        <IconComponent className="h-5 w-5 mr-5" />
                        <span className="font-medium">{name}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-md font-medium w-full">
                    Fasilitas tidak tersedia untuk tempat ini.
                  </p>
                )}
              </div>
            </div>

            {/* Galeri */}
            <div>
              <h1 className="font-bold text-2xl w-full mb-5">Galeri</h1>
              <div className="mt-5 flex gap-4 overflow-x-scroll snap-x snap-mandatory pb-4">
                {galleryImages.length > 0 ? (
                  galleryImages.map(
                    (img: { image_url: string }, index: number) => (
                      <div
                        key={index}
                        className="w-[300px] h-[300px] relative shrink-0 snap-center rounded-lg overflow-hidden"
                      >
                        <ImageZoom>
                          <Image
                            alt="Placeholder image"
                            className="h-auto w-96"
                            height={800}
                            src={img.image_url || "/placeholder-image.png"}
                            unoptimized
                            width={1000}
                          />
                        </ImageZoom>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-md font-medium w-full">
                    Galeri tidak tersedia untuk tempat ini.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: BOOKING */}
          <div className="w-full md:w-1/4 h-full">
            <VenueBookingForm
              venueId={venue.id}
              hargaPerUnit={hargaNumber}
              tipeSewa={tipe_sewa}
              kapasitasMaks={kapasitas_maks || 1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempatDetail;
