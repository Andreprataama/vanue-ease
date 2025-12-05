import { Search, Clock, StarsIcon } from "lucide-react";

const BerandaKeuntungan = () => {
  return (
    <section className="grid grid-cols-3 p-25 h-64 gap-10">
      {/* 1 */}
      <div className="flex gap-4">
        <div className="flex items-center justify-center">
          <Clock size={60} />
        </div>
        <div className="max-w-sm">
          <p className=" font-bold mb-1">
            Pemesanan Venue Dalam Hitungan Detik
          </p>
          <p className="text-gray-600">
            Akses ribuan tempat dan lakukan reservasi instan tanpa proses yang
            rumit.
          </p>
        </div>
      </div>
      {/* 2 */}
      <div className="flex gap-4">
        <div className="flex items-center justify-center">
          <Search size={60} />
        </div>
        <div className="max-w-sm">
          <p className=" font-bold mb-1">
            Temukan Tempat Ideal Anda Dengan Mudah
          </p>
          <p className="text-gray-600">
            Filter akurat, pencarian cerdas, dan peta interaktif. Mencari tempat
            tak pernah semudah ini.
          </p>
        </div>
      </div>
      {/* 3 */}
      <div className="flex gap-4">
        <div className="flex items-center justify-center">
          <StarsIcon size={60} />
        </div>
        <div className="max-w-sm">
          <p className=" font-bold mb-1">Beragam Pilihan, Kualitas Terjamin</p>
          <p className="text-gray-600">
            Mulai dari meeting room eksklusif hingga studio kreatif, semua venue
            terverifikasi.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BerandaKeuntungan;
