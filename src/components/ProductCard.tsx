"use client";

import { useState } from "react";

import { HeartIcon, MapPin, User } from "lucide-react";

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

const ProductCard = () => {
  const [liked, setLiked] = useState<boolean>(false);

  return (
    <div className="relative max-w-md rounded-xl bg-white  shadow-lg">
      <div className="flex h-60 items-center justify-center ">
        <Image
          src="https://images.unsplash.com/photo-1764609627878-4cb050c7c583?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Product Image"
          width={300}
          height={300}
          className="w-full overflow-hidden rounded-t-xl"
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
          <CardTitle className="text-2xl">Ammbarukmo Plaza</CardTitle>
          <CardDescription className="flex flex-col gap-1">
            <Badge variant="outline" className="rounded-sm text-sm">
              Meeting Room
            </Badge>
            <div className="flex items-center mt-2">
              <MapPin className="inline mr-1 h-4 w-4" />
              <span>Bandung, Indonesia</span>
            </div>
            <div className="flex items-center mt-2">
              <User className="inline mr-1 h-4 w-4" />
              <span>1 - jumlah Orang</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Tempat ini berguna untuk mengadakan meeting dengan fasilitas lengkap
            dan nyaman.
          </p>
        </CardContent>
        <CardFooter className="justify-between gap-3 max-sm:flex-col max-sm:items-stretch">
          <div className="flex flex-col">
            <span className="text-sm font-medium uppercase">Harga</span>
            <div className="flex flex-row justify-between items-baseline gap-1">
              <span className="text-lg font-bold">Rp 500.000</span>
              <span className="text-lg font-bold ">/ Hari</span>
            </div>
          </div>
          <Link href={"/vanue/ammbarukmo-plaza"} className="mt-5">
            <Button className="w-full">Lihat Detail</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProductCard;
