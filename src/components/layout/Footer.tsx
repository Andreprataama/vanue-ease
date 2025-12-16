"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white">
      {/* 1. Kontainer Utama: flex-col di mobile, flex-row di md ke atas */}
      <div className="flex flex-col md:flex-row justify-between p-8 md:p-20">
        {/* Kolom Kiri: Logo & Deskripsi */}
        {/* Tambahkan margin bawah di mobile (mb-10) dan hilangkan margin kiri (ml-0 md:ml-5) */}
        <div className="space-y-4 ml-0 md:ml-5 mb-10 md:mb-0 w-full md:w-1/3">
          <h3 className="text-3xl font-bold text-white tracking-wider mb-4 md:mb-10">
            Venue Ease
          </h3>
          <p className="text-gray-400 text-sm max-w-lg">
            Mencari tempat nyaman dan aman. Sudah ribuan orang mencari dan
            memesan tempat terbaik hanya di sini. Percayakan pencarian tempat
            mudah dan cepat.
          </p>
          <h1 className="pt-4 font-semibold text-lg">Hubungi Kami</h1>
          <div className="flex space-x-4 pt-2">
            <Link
              href="#"
              aria-label="Facebook"
              className="text-gray-400 hover:text-blue-500 transition"
            >
              <Facebook size={24} />
            </Link>
            <Link
              href="#"
              aria-label="Instagram"
              className="text-gray-400 hover:text-pink-500 transition"
            >
              <Instagram size={24} />
            </Link>
            <Link
              href="#"
              aria-label="X/Twitter"
              className="text-gray-400 hover:text-blue-400 transition"
            >
              <Twitter size={24} />
            </Link>
          </div>
        </div>

        {/* Kolom Kanan: Navigasi Map (Di mobile: menumpuk vertikal/grid) */}
        {/* Menggunakan grid di mobile untuk tata letak 2 kolom yang lebih baik */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:flex gap-y-8 md:gap-x-16 lg:gap-x-20 w-full md:w-auto">
          {/* Menu 1 : Sitemap */}
          <div className="flex flex-col space-y-3">
            <h4 className="mb-3 font-semibold text-lg">Sitemap</h4>
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition text-sm"
            >
              Beranda
            </Link>
            <Link
              href="/Tempat"
              className="text-gray-400 hover:text-white transition text-sm"
            >
              Tempat
            </Link>
            <Link
              href="/Tentang-kami"
              className="text-gray-400 hover:text-white transition text-sm"
            >
              Tentang
            </Link>
            <Link
              href="/Kontak-kami"
              className="text-gray-400 hover:text-white transition text-sm"
            >
              Kontak
            </Link>
          </div>

          {/* Menu 2 : Eksplorasi */}
          <div className="flex flex-col space-y-3">
            <h4 className="mb-3 font-semibold text-lg">Explorasi</h4>
            <Link
              href="/Tempat"
              className="text-gray-400 hover:text-white transition text-sm"
            >
              Semua Kategori
            </Link>
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition text-sm"
            >
              Venue Populer
            </Link>
          </div>

          {/* Menu 3: Bantuan */}
          <div className="flex flex-col space-y-3 mt-4 sm:mt-0 col-span-2 sm:col-span-1">
            <h4 className="mb-3 font-semibold text-lg">Bantuan</h4>
            <Link
              href="/Bantuan"
              className="text-gray-400 hover:text-white transition text-sm"
            >
              Pusat Bantuan
            </Link>
            <Link
              href="/Kontak-kami"
              className="text-gray-400 hover:text-white transition text-sm"
            >
              Hubungi Kami
            </Link>
            <Link
              href="/Bantuan#BantuanFAQ"
              className="text-gray-400 hover:text-white transition text-sm"
            >
              FAQ
            </Link>
          </div>
        </div>
      </div>

      {/* Bagian Copyright */}
      <div className="w-full py-4">
        <p className="text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} Venue Ease. Hak Cipta Dilindungi.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
