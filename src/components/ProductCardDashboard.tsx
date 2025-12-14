"use client";

import { useState } from "react";
import { HeartIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { Venue } from "@/type/venua";

interface ProductCardProps {
  ruanganData: Venue;
}

const ProductCard = ({ ruanganData }: ProductCardProps) => {
  const [liked, setLiked] = useState<boolean>(false);

  const {
    id,
    nama_ruangan,
    tipe_sewa,
    harga_per_jam,
    harga_per_hari,
    images,
    venueCategories,
  } = ruanganData;

  const imageUrl = images?.[0]?.image_url || "/images/placeholder.jpg";

  const kategoriNama =
    venueCategories?.[0]?.category.nama_kategori || "Tidak Diketahui";

  const hargaString = tipe_sewa === "perhari" ? harga_per_hari : harga_per_jam;
  const hargaNumber = hargaString ? parseInt(hargaString) : null;

  const hargaDisplay = hargaNumber
    ? `Rp ${hargaNumber.toLocaleString("id-ID")}`
    : "Hubungi";
  const tipeSewaDisplay = tipe_sewa === "perhari" ? "/ Hari" : "/ Jam";

  const detailUrl = `/Tempat/${id}`;

  return (
    <div className="relative max-w-md rounded-xl bg-white shadow-lg border">
      <div className="flex h-60 items-center justify-center ">
        <Image
          src={imageUrl}
          alt={nama_ruangan}
          width={300}
          height={300}
          className="w-full overflow-hidden rounded-t-xl object-cover h-60"
        />
      </div>
      <Button
        size="icon"
        onClick={() => setLiked(!liked)}
        className="bg-primary/10 hover:bg-primary/20 absolute top-4 right-4 rounded-full"
      >
        <HeartIcon
          className={cn(
            liked ? "fill-destructive stroke-destructive" : "stroke-white"
          )}
        />
        <span className="sr-only">Like</span>
      </Button>
      <Card className="border-none ">
        <CardHeader>
          <CardTitle className="text-2xl truncate">{nama_ruangan}</CardTitle>
          <CardDescription className="flex flex-col gap-1">
            <Badge variant="outline" className="rounded-sm text-sm">
              {kategoriNama} {/* Data DInamis */}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent></CardContent>
        <CardFooter className="justify-between gap-3 max-sm:flex-col max-sm:items-stretch">
          <div className="flex flex-col">
            <span className="text-sm font-medium uppercase">Harga</span>
            <div className="flex flex-row justify-between items-baseline gap-1">
              <span className="text-lg font-bold">{hargaDisplay}</span>{" "}
              {/* Data DInamis */}
              <span className="text-lg font-bold ">{tipeSewaDisplay}</span>{" "}
            </div>
          </div>
          <Link href={detailUrl} className="mt-5">
            <Button className="w-full">Lihat Detail</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProductCard;
