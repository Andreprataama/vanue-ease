"use client";
import { Trophy, Target } from "lucide-react";

const TentangKamiMain = () => {
  return (
    <div className="w-full">
      {/* 1 */}
      <section className="w-full lg:px-8 py-10 bg-white text-black">
        <div className="gap-10">
          <div>
            <h1 className="text-5xl px-2 md:text-[120px] font-light mb-8 leading-tight">
              Masa Depan <br /> Pencarian Venue Ada di Sini
            </h1>
          </div>
          <div className="pt-6 w-full flex justify-between">
            <p></p>
            <p className="text-xs md:text-xl w-50 md:w-100 text-gray-800">
              Kami hadir dengan misi untuk mengubah cara orang menemukan dan
              memesan tempat dengan membuatnya lebih cepat, transparan, dan
              mudah diakses oleh siapa pun.
            </p>
          </div>
        </div>
      </section>

      <hr className="border-gray-200" />
      {/* 2 */}
      <section className="w-full bg-black text-white py-16 md:py-24">
        <div className="md:max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 md:gap-10 mx-auto justify-center">
            <div className="flex justify-center items-center md:w-1/2">
              <h2 className="text-2xl  md:text-5xl font-semibold md:max-w-md">
                Menghubungkan Kebutuhan dan Kesempatan
              </h2>
            </div>
            <div className="md:w-1/2 space-y-4 md:space-y-6 pt-4 md:pt-2">
              <p className="text-gray-200 leading-relaxed">
                VenueEase adalah platform pencarian venue yang memudahkan siapa
                pun menemukan tempat ideal untuk acara, rapat, hingga pertemuan
                kreatif.
              </p>
              <p className="text-gray-200 leading-relaxed">
                Lebih dari sekadar direktori, kami membantu pemilik tempat lokal
                meningkatkan eksposur, dan pengguna mendapatkan pengalaman
                pemesanan yang efisien serta terpercaya.
              </p>

              <p className="text-gray-200 leading-relaxed pt-2 italic font-medium  mt-4">
                Kami percaya bahwa setiap acara berhak memiliki tempat yang
                sempurna dan setiap tempat berhak ditemukan oleh orang yang
                tepat.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* 3 */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10 md:py-24 bg-white text-black">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="col-span-1 border-2 p-12 rounded-2xl">
            <div className="flex gap-4 items-center mb-4">
              <Trophy className="" size={25} />
              <h3 className="text-3xl font-bold">Visi Kami</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Menjadi platform pencarian venue terbaik di Indonesia yang
              menghubungkan tempat dan ide menjadi satu pengalaman tak
              terlupakan.
            </p>
          </div>

          <div className="col-span-1 border-2 p-12 rounded-2xl">
            <div className="flex gap-4 items-center mb-4">
              <Target className="" size={25} />
              <h3 className="text-3xl font-bold">Misi Kami</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Menciptakan ekosistem pencarian dan penyewaan venue yang saling
              menguntungkan, dengan menghubungkan pengguna dan pemilik tempat
              melalui teknologi yang efisien, informasi yang transparan, serta
              layanan yang mudah diakses dan tepercaya.
            </p>
          </div>
        </div>
      </section>
      <hr className="border-gray-300" />
    </div>
  );
};

export default TentangKamiMain;
