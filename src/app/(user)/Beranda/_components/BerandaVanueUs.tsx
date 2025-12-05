const venueData = [
  {
    number: 1,
    description:
      "Venue Terverifikasi. Semua tempat telah dicek kualitasnya. Tanpa risiko, tanpa venue fiktif.",
  },
  {
    number: 2,
    description:
      "Harga Transparan. Lihat harga final sejak awal. Tanpa biaya tersembunyi.",
  },
  {
    number: 3,
    description:
      "Dukungan Pelanggan 24/7. Tim kami siap membantu Anda kapan saja.",
  },
];

const BerandaVanueUs = () => {
  return (
    <section className="flex flex-row w-full h-full gap-10 px-25 justify-center py-20">
      <div className="w-1/2 items-center justify-center flex">
        <div>
          <h1 className="text-4xl">
            Mengapa Harus <br />
            Memilih{" "}
          </h1>
          <h1 className="text-7xl text-end font-semibold">Venue Ease?</h1>
        </div>
      </div>
      <div className="w-1/2">
        {venueData.map((item) => (
          <div
            key={item.number}
            className="flex flex-row gap-10 border-t-2 border-gray-700 p-10"
          >
            <div className="text-6xl  font-bold w-1/4 flex justify-center items-start">
              {item.number}
            </div>
            <div className="text-xl font-semibold w-3/4">
              {item.description}
            </div>
          </div>
        ))}

        <div className="border-b-2 border-gray-700 w-full"></div>
      </div>
    </section>
  );
};

export default BerandaVanueUs;
