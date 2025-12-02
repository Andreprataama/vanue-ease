// src/app/(owner)/dashboard/kelola-vanue/_components/colums.tsx
"use client";

import { formatRupiah } from "@/utils/currency";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

// --- TIPE DATA VANUE ---
export type Venue = {
  id: number;
  nama_ruangan: string;
  tipe_sewa: "perhari" | "perjam" | null;
  harga_per_jam: string | number | null;
  harga_per_hari: string | number | null;
  kapasitas_maks: number | null;
  is_published: boolean;
  images: { image_url: string }[];
  venueCategories: { category: { nama_kategori: string } }[];
};

// --- Fungsi Hapus Venue ---
const deleteVenueAction = async (
  venueId: number,
  venueName: string,
  router: ReturnType<typeof useRouter> // Menggunakan tipe yang tepat
) => {
  if (
    !confirm(
      `Apakah Anda yakin ingin menghapus Vanue: ${venueName}? Tindakan ini tidak dapat dibatalkan.`
    )
  ) {
    return;
  }

  try {
    // Memanggil API DELETE dengan Query Parameter
    const response = await fetch(`/api/vanue?id=${venueId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      toast.success(`Vanue "${venueName}" berhasil dihapus.`);
      // Refresh halaman untuk memperbarui data tabel
      router.refresh();
    } else {
      const errorData = await response.json();
      toast.error(errorData.message || "Gagal menghapus venue.");
    }
  } catch (error) {
    console.error("Error menghapus venue:", error);
    toast.error("Terjadi kesalahan jaringan atau server saat menghapus.");
  }
};

// --- Komponen Cell Aksi yang Benar Menggunakan Hook ---
// Hooks dipanggil di top level fungsi ini
const ActionsCell = ({ row }: { row: any }) => {
  const router = useRouter(); // FIX: Hook dipanggil di level teratas komponen ini
  const venue = row.original as Venue;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* LINK EDIT KE HALAMAN DINAMIS */}
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/kelola-vanue/edit/${venue.id}`}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Vanue
          </Link>
        </DropdownMenuItem>

        {/* Aksi untuk Hapus */}
        <DropdownMenuItem
          onClick={() =>
            deleteVenueAction(venue.id, venue.nama_ruangan, router)
          }
          className="text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20"
        >
          <Trash2 className="mr-2 h-4 w-4 text-destructive" />
          Hapus Vanue
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<Venue>[] = [
  {
    accessorKey: "nama_ruangan",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Vanue
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const venue = row.original;
      const imageUrl =
        venue.images?.[0]?.image_url || "/assets/default_venue.jpg";

      return (
        <div className="flex items-center gap-3">
          <Image
            src={imageUrl}
            alt={venue.nama_ruangan}
            // FIX: Tambahkan width dan height eksplisit untuk next/image
            width={40}
            height={40}
            className="size-10 object-cover rounded-md shadow-sm"
          />
          <div className="font-medium text-sm">{venue.nama_ruangan}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "tipe_sewa",
    header: "Tipe Sewa",
    cell: ({ row }) => {
      const tipe = row.getValue("tipe_sewa") as "perhari" | "perjam" | null;
      return (
        <Badge variant="secondary" className="capitalize">
          {tipe === "perhari"
            ? "Per Hari"
            : tipe === "perjam"
            ? "Per Jam"
            : "-"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "harga_per_hari",
    header: () => <div className="text-right">Harga</div>,
    cell: ({ row }) => {
      const venue = row.original;
      const price =
        venue.tipe_sewa === "perjam"
          ? venue.harga_per_jam
          : venue.harga_per_hari;
      const unit = venue.tipe_sewa === "perjam" ? "/ Jam" : "/ Hari";

      const priceValue = price ? parseFloat(String(price)) : 0;
      const formattedPrice =
        priceValue > 0
          ? `${formatRupiah({ price: priceValue })} ${unit}`
          : "Tidak Ditentukan";

      return (
        <div className="text-right font-medium text-sm">{formattedPrice}</div>
      );
    },
  },
  {
    accessorKey: "is_published",
    header: "Status Publikasi",
    cell: ({ row }) => {
      const isPublished = row.getValue("is_published") as boolean;
      return (
        <Badge
          className={
            isPublished
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-500 hover:bg-gray-600 text-white"
          }
        >
          {isPublished ? "Published" : "Draft"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ActionsCell, // FIX: Menggunakan komponen ActionsCell
  },
];
