"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, User, Wifi, Sun, Camera, Zap } from "lucide-react";

const ProductDetail = () => {
  const venueName = "Argent Coffee";
  const mainCategory = "Meeting Room";
  const mainImage =
    "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=2600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  const hargaAwal = "50.000";
  const tipeHarga = "/ Jam";
  const fasilitas = [
    { nama: "AC", icon: Sun },
    { nama: "WiFi", icon: Wifi },
    { nama: "Parkir", icon: Zap },
    { nama: "Proyektor", icon: Camera },
  ];
  const galeriImages = [
    "/placeholder/coffee_cafe.jpg",
    "/placeholder/coffee_cups.jpg",
    "/placeholder/coffee_outside.jpg",
    "/placeholder/coffee_cafe.jpg",
    "/placeholder/coffee_cups.jpg",
    "/placeholder/coffee_outside.jpg",
  ];

  return (
    <div className="min-h-screen">
      <div className="relative h-[400px] w-full bg-black rounded-2xl overflow-hidden mb-8">
        <Image
          src={mainImage}
          alt={venueName}
          layout="fill"
          objectFit="cover"
          className="opacity-70 rounded-2xl overflow-hidden"
        />
        <div className="absolute inset-0  from-black/80 to-transparent p-10 flex flex-col justify-end">
          <p className="text-white/80 text-lg font-medium mb-2">
            {mainCategory}
          </p>
          <h1 className="text-white text-5xl font-extrabold">{venueName}</h1>
          <div className="flex items-center text-white/90 mt-4">
            <MapPin className="h-5 w-5 mr-2" />
            <span>Timaho, Yogyakarta</span>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-6 mb-8">
        <div className="flex flex-col gap-6 p-8 w-3/4  shadow-xl rounded-2xl ">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 " />
            <span>Timaho, Yogyakarta</span>
          </div>
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            <span>1 - (Jumlah Max)</span>
          </div>
          <div className="space-y-4">
            <h1 className="font-bold text-2xl">Tentang Tempat</h1>
            <p className="text-md w-[90%] leading-relaxed font-medium text-justify">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fugit
              illo cum, sequi delectus temporibus non vel nostrum atque
              corporis, cupiditate, ab alias quia tempore accusamus quae quos
              facilis accusantium est ratione rem unde voluptatem! Cupiditate
              nobis, similique consequuntur harum iusto est ea rerum iure quo
              nesciunt, voluptatum dolorem magnam eius commodi.
              <br />
              Voluptate consequuntur repellat quia incidunt tempore eos sit
              praesentium est maiores blanditiis omnis harum saepe ipsa sint
              sapiente voluptatem distinctio a, cupiditate ab eum! Quas at
              laborum ea consequuntur, dignissimos natus soluta magnam numquam!
              Autem, eius laboriosam earum tempore veritatis dolor vel itaque
              nostrum commodi iure quod voluptas debitis.
            </p>
          </div>
          <div className="space-y-6 w-2/4">
            <h1 className="font-bold text-2xl">Fasilitas</h1>
            <div className="grid grid-cols-2 gap-4">
              {fasilitas.map((fasilitasItem, index) => (
                <div key={index} className="flex items-center gap-2 ">
                  <fasilitasItem.icon className="h-6 w-6 text-primary" />
                  <span className="font-medium">{fasilitasItem.nama}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h1 className="font-bold text-2xl w-full mb-5">Galeri</h1>
            <div className="mt-10 flex gap-4 overflow-x-scroll snap-x snap-mandatory">
              {galeriImages.map((src, index) => (
                <div
                  key={index}
                  className=" flex-shrink-0 w-1/3 h-[200px] rounded-lg overflow-hidden snap-center"
                >
                  <Image
                    src={src || "/images/placeholder.jpg"}
                    alt={`Galeri ${index + 1}`}
                    width={400}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-1/4  flex justify-center items-center shadow-xl rounded-2xl">
          <h1>Components Input Booking</h1>
        </div>
      </div>
      <div className="w-full h-64 bg-white">Another Place</div>
    </div>
  );
};

export default ProductDetail;
