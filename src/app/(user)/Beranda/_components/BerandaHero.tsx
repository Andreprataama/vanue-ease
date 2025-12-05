import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const BerandaHero = () => {
  return (
    <section className="relative w-full h-[80vh] md:h-[90vh] ">
      <div className="absolute inset-0 z-0">
        <Image
          src={
            "https://images.unsplash.com/photo-1604349779113-ddc126b8bf4c?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          alt="Interior venue modern"
          fill
          priority
          className="object-cover"
          style={{ filter: "brightness(50%)" }}
        />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-between text-white p-5 md:p-10 lg:px-20 lg:py-16">
        <div className="mt-50 max-w-4xl">
          <h1 className="text-xl sm:text-5xl lg:text-5xl  leading-tight tracking-tighter">
            Masa Depan
            <span className="text-yellow-400 font-semibold"> Reservasi </span>
            Tempat
            <br /> Sudah Tiba. Pesan Dalam <br /> Hitungan Detik.
          </h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-10">
          <p className="text-sm text-gray-300 max-w-lg leading-relaxed">
            Waktu Anda berharga. VenueEase menyediakan ribuan pilihan tempat
            dengan ketersediaan live, memungkinkan Anda membandingkan, memilih,
            dan mendapatkan konfirmasi instan. Booking yang cepat, mudah, dan
            bebas stres.
          </p>

          <Link href="/Tempat" passHref>
            <Button className="border-2 w-[150px] hover:bg-white hover:text-black hover:border-black">
              Explore
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BerandaHero;
