"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/utils/cn";
import {
  Filter,
  ChevronDown,
  Briefcase,
  Building,
  Users,
  DollarSign,
  MapPin,
  Gauge,
} from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// --- Data Filter Venue ---
const filterOptions = [
  {
    id: "category",
    name: "Kategori Venue",
    options: [
      { value: "meeting", label: "Ruang Meeting", icon: Briefcase },
      { value: "hall", label: "Gedung & Aula", icon: Building },
      { value: "party", label: "Pesta & Gathering", icon: Users },
    ],
  },
  {
    id: "harga",
    name: "Tipe Harga",
    options: [
      { value: "perjam", label: "Per Jam", icon: DollarSign },
      { value: "perhari", label: "Per Hari", icon: DollarSign },
    ],
  },
  {
    id: "kapasitas",
    name: "Kapasitas",
    // Data opsi lama dipertahankan, tetapi tidak akan dirender.
    options: [
      { value: "1-50", label: "1 - 50 Orang", icon: Users },
      { value: "51-200", label: "51 - 200 Orang", icon: Users },
    ],
  },
];

interface FilterGroupProps {
  filter: (typeof filterOptions)[0];
  isMobile?: boolean;
}

const FilterGroup: React.FC<FilterGroupProps> = ({
  filter,
  isMobile = false,
}) => {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={filter.id}
      className="w-full"
    >
      <AccordionItem
        value={filter.id}
        className={cn("py-3 border-none", isMobile ? "px-0" : "")}
      >
        <AccordionTrigger
          className={cn(
            "text-sm w-full items-center justify-between py-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300",
            isMobile
              ? "-mx-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              : "bg-transparent hover:bg-transparent"
          )}
        >
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {filter.name}
          </span>
        </AccordionTrigger>

        <AccordionContent className="pt-4 pb-2">
          <div className="space-y-4">
            {/* ---------------------------------------------------- */}
            {/* LOGIC UNTUK FILTER KAPASITAS (INPUT FIELD) */}
            {/* ---------------------------------------------------- */}
            {filter.id === "kapasitas" && (
              <div className="space-y-3">
                <Input
                  type="number"
                  placeholder="Min Kapasitas (Orang)"
                  min={1}
                />
                <Input
                  type="number"
                  placeholder="Max Kapasitas (Orang)"
                  min={1}
                />
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* LOGIC UNTUK FILTER HARGA (CHECKBOX + INPUT FIELD) */}
            {/* ---------------------------------------------------- */}
            {filter.id === "harga" && (
              <>
                <div className="space-y-3">
                  {/* Checkboxes untuk Tipe Harga (Per Jam/Per Hari) */}
                  {filter.options.map((option, optionIdx) => (
                    <div key={option.value} className="flex items-center">
                      <Checkbox
                        id={`filter-${isMobile ? "mobile-" : ""}${
                          filter.id
                        }-${optionIdx}`}
                        name={`${filter.id}[]`}
                        value={option.value}
                        className="h-4 w-4 rounded border-gray-300 text-yellow-500"
                      />
                      <Label
                        htmlFor={`filter-${isMobile ? "mobile-" : ""}${
                          filter.id
                        }-${optionIdx}`}
                        className="ml-3 text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>

                {/* Input Harga Min/Max (diberi jarak dari checkbox di atas) */}
                <div className="pt-4 space-y-3 border-t border-gray-100 dark:border-gray-800">
                  <Input type="number" placeholder="Harga Min (Rp)" min={0} />
                  <Input type="number" placeholder="Harga Max (Rp)" min={0} />
                </div>
              </>
            )}

            {/* ---------------------------------------------------- */}
            {/* LOGIC UNTUK FILTER KATEGORI (CHECKBOX) */}
            {/* ---------------------------------------------------- */}
            {filter.id === "category" &&
              filter.options.map((option, optionIdx) => (
                <div key={option.value} className="flex items-center">
                  <Checkbox
                    id={`filter-${isMobile ? "mobile-" : ""}${
                      filter.id
                    }-${optionIdx}`}
                    name={`${filter.id}[]`}
                    value={option.value}
                    className="h-4 w-4 rounded border-gray-300 text-yellow-500"
                  />
                  <Label
                    htmlFor={`filter-${isMobile ? "mobile-" : ""}${
                      filter.id
                    }-${optionIdx}`}
                    className="ml-3 text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const TempatFilterSection = () => {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  return (
    <div className="bg-background">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-gray-200 dark:border-gray-700 pt-10 pb-6">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Temukan Vanue sesuai kebutuhanmu
            </h1>

            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                  >
                    Urutkan
                    <ChevronDown
                      className="-mr-1 ml-1 h-5 w-5  text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-card dark:bg-popover shadow-lg"
                >
                  <DropdownMenuItem>
                    <Link href="#" className="w-full block">
                      Paling Populer
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="#" className="w-full block">
                      Terbaru
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="#" className="w-full block">
                      Harga: Terendah
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
                >
                  <span className="sr-only">Filters</span>
                  <Filter className="size-5" />
                </Button>
              </SheetTrigger>
            </div>
          </div>

          <section aria-labelledby="products-heading" className="pt-6 pb-24">
            <h2 id="products-heading" className="sr-only">
              Daftar Venue
            </h2>

            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
              {/* Kolom Kiri: Filters Desktop */}
              <form className="hidden lg:block">
                {filterOptions.map((filter) => (
                  <div
                    key={filter.id}
                    className="border-b border-gray-200 dark:border-gray-700 py-6"
                  >
                    {/* FilterGroup Desktop */}
                    <FilterGroup filter={filter} />
                  </div>
                ))}

                <Button className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-black">
                  Terapkan Filter
                </Button>
              </form>

              {/* Kolom Kanan: Product Grid */}
              <div className="lg:col-span-3">
                <div className="h-96 border-2 border-dashed flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-muted-foreground rounded-lg">
                  Tempat Grid Daftar Venue (Ganti dengan kartu venue Anda)
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Sheet Content (Mobile Dialog) */}
        <SheetContent
          side="right"
          className="w-full sm:max-w-xs bg-white dark:bg-card overflow-y-auto p-0"
        >
          <div className="p-4">
            <SheetHeader>
              <SheetTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Filters
              </SheetTitle>
            </SheetHeader>

            <form className="mt-4 border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
              {filterOptions.map((filter) => (
                <div
                  key={filter.id}
                  className="py-6 border-t border-gray-200 dark:border-gray-700"
                >
                  {/* FilterGroup Mobile */}
                  <FilterGroup filter={filter} isMobile={true} />
                </div>
              ))}

              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  Terapkan Filter
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TempatFilterSection;
