import { Button } from "@/components/ui/button";
import Link from "next/link";

const BerandaCTA = () => {
  return (
    <section className="w-full h-64 items-center justify-center flex space-y-4 flex-col py-50  text-center">
      <p className="text-4xl font-bold">
        Punya Tempat Keren Tapi Bingung Cara Meramaikannya?
      </p>
      <p className="text-md">
        Mari daftar dan ubah tempat Anda menjadi sumber pendapatan yang
        maksimal.
      </p>
      <Link href="/dashboard">
        <Button className="bg-black hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-sm mt-5">
          Daftar Tempat Anda Sekarang
        </Button>
      </Link>
    </section>
  );
};

export default BerandaCTA;
