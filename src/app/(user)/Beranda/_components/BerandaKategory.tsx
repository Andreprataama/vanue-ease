import { Briefcase, Building, Users, Coffee, Palette } from "lucide-react";
import Link from "next/link";

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
    <section className="h-full p-4 md:p-10">
      <div className="w-full bg-black rounded-xl p-6">
        <h1 className="text-white text-2xl ml-2 font-extrabold">Kategori</h1>
        <div className="grid grid-cols-2 gap-4 md:flex md:flex-row items-center">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/Tempat?kategori=${encodeURIComponent(category.name)}`}
              passHref
            >
              <div className="items-center space-x-4 p-2 md:p-4 rounded-lg cursor-pointer mt-4">
                <div className="items-center flex justify-center w-30 md:w-40 border-2 rounded-xl h-30 hover:border-yellow-400 ">
                  <category.icon className="text-white " size={75} />
                </div>
                <h1 className="text-white text-md text-center mt-2 font-semibold">
                  {category.name}
                </h1>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BerandaKategory;
