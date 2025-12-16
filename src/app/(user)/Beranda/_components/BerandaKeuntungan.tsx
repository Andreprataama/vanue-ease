import { Search, Clock, StarsIcon } from "lucide-react";

const BerandaKeuntungan = () => {
  return (
    <section className="md:grid md:grid-cols-3 p-12 h-full md:h-35 gap-10 space-y-10">
      {/* 1 */}
      <div className="flex md:gap-4 gap-10 item-center h-fit ">
        <Clock className="h-10 w-20 md:h-20 md:w-20" />
        <div className="max-w-sm">
          <p className=" font-bold mb-1 text-sm">
            Pemesanan Venue Dalam Hitungan Detik
          </p>
          <p className="text-gray-600 text-sm">
            Akses ribuan tempat dan lakukan reservasi instan tanpa proses yang
            rumit.
          </p>
        </div>
      </div>
      {/* 2 */}
      <div className="flex md:gap-4 gap-10 item-center h-fit">
        <Search className="h-10 w-20 md:h-20 md:w-20" />
        <div className="max-w-sm">
          <p className=" font-bold mb-1 text-sm md:text">
            Temukan Tempat Ideal Anda Dengan Mudah
          </p>
          <p className="text-gray-600 text-sm">
            Filter akurat, pencarian cerdas, dan peta interaktif. Mencari tempat
            tak pernah semudah ini.
          </p>
        </div>
      </div>
      {/* 3 */}
      <div className="flex md:gap-4 gap-10 item-center">
        <StarsIcon className="h-10 w-20 md:h-20 md:w-20" />
        <div className="max-w-sm">
          <p className=" font-bold mb-1 text-sm">
            Beragam Pilihan, Kualitas Terjamin
          </p>
          <p className="text-gray-600 text-sm">
            Mulai dari meeting room eksklusif hingga studio kreatif, semua venue
            terverifikasi.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BerandaKeuntungan;
