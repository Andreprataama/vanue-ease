"use client";
import Link from "next/link";
import { useState } from "react";

import { Button } from "../ui/button";
import { Building, Menu, X } from "lucide-react";
import Image from "next/image";

const navigations = [
  { href: "/", label: "Beranda" },
  { href: "/Tempat", label: "Tempat" },
  { href: "/Tentang-kami", label: "Tentang" },
  { href: "/Kontak-kami", label: "Kontak" },
  { href: "/Bantuan", label: "Bantuan" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <header className="relative z-50 bg-black shadow-lg">
      <div className="flex h-16 items-center  justify-between px-4 md:px-6">
        <Link
          href="/"
          className="flex text-xl md:text-xl font-bold text-white  jutify-center items-center tracking-wider"
          onClick={handleLinkClick}
        >
          <Building className="mr-2 items-center justify-center" size={20} />{" "}
          Venue Ease
        </Link>

        <nav className="hidden md:flex gap-2 font-semibold">
          {navigations.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="p-2 rounded-sm text-white hover:text-gray-300 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:bg-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
      <div
        className={`md:hidden absolute w-full bg-black transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col p-4 space-y-2">
          {navigations.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block p-3 text-white font-medium hover:bg-gray-800 rounded-md transition-colors"
              onClick={handleLinkClick}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
