import { Briefcase, Building, Users, Coffee, Palette } from "lucide-react";

const categories = [
  {
    name: "Ruang Meeting",
    icon: Briefcase,
  },
  {
    name: "Gedung & Aula",
    icon: Building,
  },
  {
    name: "Pesta & Gathering",
    icon: Users,
  },
  {
    name: "Kafe & Restoran",
    icon: Coffee,
  },
  {
    name: "Studio & Kreatif",
    icon: Palette,
  },
];

const BerandaKategory = () => {
  return (
    <section className="h-full p-10">
      <div className="w-full bg-black rounded-xl p-6">
        <h1 className="text-white text-2xl ml-2 font-extrabold">Kategori</h1>
        <div className="flex flex-row items-center">
          {categories.map((category) => (
            <div
              key={category.name}
              className="items-center space-x-4 p-4 rounded-lg cursor-pointer mt-4"
            >
              <div className="items-center flex justify-center w-40 border-2 rounded-xl h-30 hover:border-yellow-400 ">
                <category.icon className="text-white" size={75} />
              </div>
              <h1 className="text-white text-md text-center mt-2 font-semibold">
                {category.name}
              </h1>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BerandaKategory;
