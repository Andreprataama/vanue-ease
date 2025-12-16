import Image from "next/image";

const TempatHeroSection = () => {
  return (
    <section className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden bg-gray-900">
      <Image
        src={
          "https://images.unsplash.com/photo-1513569771920-c9e1d31714af?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
        alt="Venue search background"
        fill
        priority
        className="object-cover"
        style={{ filter: "brightness(40%)" }}
        sizes="100vw"
      />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white p-5">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 text-center">
          Temukan Tempat Sempurna Anda
        </h1>
        <p className="text-xs md:text-md text-gray-300 mb-8 text-center max-w-lg">
          Jelajahi ribuan pilihan venue terbaik untuk acara apa pun.
        </p>
      </div>
    </section>
  );
};

export default TempatHeroSection;
