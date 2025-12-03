import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Venue } from "@/type/venua";

const formatRupiah = ({ price }: { price: number }) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

// Definisikan kolom tabel
export const columns: ColumnDef<Venue>[] = [
  // Kolom Nama Vanue
  {
    accessorKey: "nama_ruangan",
    header: "Nama Vanue",
  },

  // Kolom Harga
  {
    id: "harga",
    header: "Harga",
    cell: ({ row }) => {
      const venue = row.original;

      const price =
        venue.tipe_sewa === "perjam"
          ? venue.harga_per_jam
          : venue.harga_per_hari;

      const priceUnit = venue.tipe_sewa === "perjam" ? "/ Jam" : "/ Hari";
      const formattedPrice = price
        ? formatRupiah({ price: Number(price) })
        : "N/A";

      return (
        <div className="font-medium">
          {formattedPrice}{" "}
          <span className="text-muted-foreground text-sm">{priceUnit}</span>
        </div>
      );
    },
  },

  // Kolom Action (Edit dan Hapus)
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const venue = row.original;

      // Mengambil fungsi handler dari prop 'meta' tabel
      const { onDelete } = table.options.meta as {
        onDelete: (id: number) => Promise<void>;
      };

      return (
        <div className="flex gap-2">
          {/* Tombol Edit */}
          <Link href={`/dashboard/kelola-vanue/edit/${venue.id}`} passHref>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>

          {/* Tombol Hapus: Memanggil onDelete handler dari KelolaVenueMain */}
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(venue.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
