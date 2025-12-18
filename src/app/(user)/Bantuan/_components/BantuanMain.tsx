// src/app/(user)/Bantuan/_components/BantuanMain.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Building,
  Users,
  CircleDollarSign,
  Home,
  BookOpen,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const USER_HELP_TOPICS = [
  {
    title: "Pencarian & Pemesanan Tempat",
    description: "Cara mencari, membandingkan, dan melakukan booking venue.",
    icon: Home,
    link: "#pencarian-booking",
  },
  {
    title: "Pembayaran & Pembatalan",
    description:
      "Info status pembayaran, pengembalian dana, dan kebijakan pembatalan.",
    icon: CircleDollarSign,
    link: "#pembayaran-pembatalan",
  },
  {
    title: "Ulasan & Feedback",
    description:
      "Cara memberikan ulasan dan rating pada venue yang telah Anda gunakan.",
    icon: BookOpen,
    link: "#ulasan",
  },
];

const OWNER_HELP_TOPICS = [
  {
    title: "Kelola Vanue (Tambah & Edit)",
    description:
      "Panduan untuk mendaftarkan dan memperbarui detail properti Anda.",
    icon: Building,
    link: "/dashboard/kelola-vanue",
  },
  {
    title: "Kalender & Harga",
    description:
      "Mengatur ketersediaan, memblokir slot, dan membuat aturan harga khusus.",
    icon: Calendar,
    link: "/dashboard/kalender-dan-ketersediaan",
  },
  {
    title: "Laporan & Payout",
    description:
      "Memahami pendapatan, riwayat transaksi, dan pengaturan akun bank.",
    icon: CircleDollarSign,
    link: "/dashboard/laporan-keuangan",
  },
];

const FAQ_ITEMS = [
  {
    question: "Bagaimana cara mendaftar sebagai pemilik venue?",
    answer: (
      <p>
        Anda dapat mendaftar melalui halaman{" "}
        <Link href="/register" className="text-primary hover:underline">
          Daftar
        </Link>
        , lalu Anda akan otomatis diarahkan ke Dashboard untuk mulai menambahkan
        Vanue pertama Anda.
      </p>
    ),
    id: "item-1",
  },
  {
    question: "Apa perbedaan antara 'Harga per Jam' dan 'Harga per Hari'?",
    answer: (
      <p>
        Harga per Jam digunakan untuk pemesanan singkat, sementara Harga per
        Hari cocok untuk acara yang berlangsung sepanjang hari. Anda harus
        memilih salah satu saat membuat Vanue baru.
      </p>
    ),
    id: "item-2",
  },
];

interface HelpCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
}

const HelpCard = ({ title, description, icon: Icon, link }: HelpCardProps) => {
  const isDashboardLink = link.includes("/dashboard");

  return (
    <Link href={link} className="block group">
      <Card className="h-full transition-all duration-300 hover:shadow-xl hover:border-foreground dark:hover:border-yellow-400">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <Icon className="w-8 h-8 text-foreground group-hover:text-yellow-500 transition-colors" />
        </CardHeader>
        <CardContent>
          <CardTitle className="text-lg font-bold mb-2">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
        <div className="p-4 flex justify-between items-center">
          {isDashboardLink && (
            <Badge
              variant="secondary"
              className="bg-foreground text-background"
            >
              Owner Feature
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
};

const BantuanMain = () => {
  return (
    <div className="container mx-auto py-10 lg:py-16 p-5">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground">
          Pusat Bantuan Vanue Ease
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Temukan jawaban untuk semua pertanyaan Anda, baik sebagai penyewa
          maupun pemilik venue.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <Users className="w-6 h-6 mr-3 text-foreground" />
        Untuk Penyewa
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {USER_HELP_TOPICS.map((topic, index) => (
          <HelpCard key={`user-${index}`} {...topic} />
        ))}
      </div>

      <Separator className="my-10" />

      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <Building className="w-6 h-6 mr-3 text-foreground" />
        Untuk Pemilik Venue
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {OWNER_HELP_TOPICS.map((topic, index) => (
          <HelpCard key={`owner-${index}`} {...topic} />
        ))}
      </div>

      <Separator className="my-10" />

      <div id="BantuanFAQ" className="flex flex-col items-center">
        <Badge variant="default" className="bg-yellow-400 text-black mr-3">
          FAQ
        </Badge>
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          Pertanyaan yang Sering Diajukan
        </h2>

        <Accordion type="single" collapsible className="w-full max-w-4xl">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="px-1">
              <AccordionTrigger>
                <span className="text-foreground">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="text-center mt-12">
        <Link href="/Kontak-kami">
          <Badge
            variant="outline"
            className="text-sm px-6 py-3 border-foreground hover:bg-foreground hover:text-background transition-colors cursor-pointer"
            asChild
          >
            <p>Masih butuh bantuan? Hubungi kami</p>
          </Badge>
        </Link>
      </div>
    </div>
  );
};

export default BantuanMain;
