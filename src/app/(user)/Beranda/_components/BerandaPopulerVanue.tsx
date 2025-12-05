import ProductCard from "@/components/ProductCard";

const BerandaPopulerVanue = () => {
  return (
    <section className="h-full p-10">
      <div className="w-full bg-black rounded-xl p-6 ml-2">
        <h1 className="text-white text-2xl  font-extrabold">
          Pilihan Vanue Populer
        </h1>
        <p className="text-sm  text-white/70 max-w-md mt-2">
          Lihatlah tempat-tempat pilihan yang bedasarkan lokasi anda dan tempat
          terbaik dari penyewa kami.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-10">
          <ProductCard />
        </div>
      </div>
    </section>
  );
};

export default BerandaPopulerVanue;
