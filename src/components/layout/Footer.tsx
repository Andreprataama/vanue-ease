import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white">
      <div className="flex justify-between p-20">
        {/* Vanue Ease Logo */}
        <div className="space-y-4 ml-5">
          {" "}
          <h3 className="text-3xl font-bold text-white tracking-wider mb-10">
            Venue Ease
          </h3>
          <p className="text-gray-400 text-sm max-w-75">
            Mencari tempat nyaman dan aman. Sudah ribuan orang mencari dan
            memesan tempat terbaik hanya di sini. Percayakan pencarian tempat
            mudah dan cepat.
          </p>
          <h1 className="pt-2">Hubungi Kami</h1>
          <div className="flex space-x-4 pt-2">
            <Link
              href="#"
              aria-label="Facebook"
              className="text-gray-400 hover:text-blue-500 transition"
            >
              <Facebook size={30} />
            </Link>
            <Link
              href="#"
              aria-label="Instagram"
              className="text-gray-400 hover:text-pink-500 transition"
            >
              <Instagram size={30} />
            </Link>
            <Link
              href="#"
              aria-label="X/Twitter"
              className="text-gray-400 hover:text-blue-400 transition"
            >
              <Twitter size={30} />
            </Link>
          </div>
        </div>
        {/* Vanue Ease Map */}
        <div className="flex gap-x-16">
          {" "}
          <div className="flex flex-col space-y-3">
            {/* Menu 1 : Sitemap */}
            <h4 className="mb-5 font-semibold text-lg">Sitemap</h4>
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition"
            >
              Beranda
            </Link>
            <Link
              href="/Tempat"
              className="text-gray-400 hover:text-white transition"
            >
              Tempat
            </Link>
            <Link
              href="/Tentang-kami"
              className="text-gray-400 hover:text-white transition"
            >
              Tentang
            </Link>
            <Link
              href="/Kontak-kami"
              className="text-gray-400 hover:text-white transition"
            >
              Kontak
            </Link>
          </div>
          {/* Menu 2 : Eksplorasi */}
          <div className="flex flex-col space-y-3">
            <h4 className="mb-5 font-semibold text-lg">Explorasi</h4>
            <Link
              href="/Tempat"
              className="text-gray-400 hover:text-white transition"
            >
              Semua Kategori
            </Link>
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition"
            >
              Venue Populer
            </Link>
          </div>
          {/* Menu 3: Bantuan */}
          <div className="flex flex-col space-y-3">
            <h4 className="mb-5 font-semibold text-lg">Bantuan</h4>
            <Link
              href="/Bantuan"
              className="text-gray-400 hover:text-white transition"
            >
              Pusat Bantuan
            </Link>
            <Link
              href="/Kontak-kami"
              className="text-gray-400 hover:text-white transition"
            >
              Hubungi Kami
            </Link>
            <Link
              href="/Bantuan#BantuanFAQ"
              className="text-gray-400 hover:text-white transition"
            >
              FAQ
            </Link>
          </div>
        </div>
      </div>
      {/* Bagian Copyright (Tambahan di bawah) */}
      <div className="w-full  border-gray-800 ">
        <p className="text-sm text-gray-500 text-center">
          © 2025 Venue Ease. Hak Cipta Dilindungi.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
