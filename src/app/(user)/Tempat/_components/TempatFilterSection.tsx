"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import useSWR, { Fetcher } from "swr";
import ProductCard from "@/components/ProductCard";
import { useState, useMemo, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParams, useRouter } from "next/navigation";
import { Venue, ApiResponse } from "@/type/venua";
import { Filter, X } from "lucide-react";

// --- Konfigurasi Statis ---

const categoryFiltersTab = [
  { id: 1, value: "Ruang Meeting", label: "Ruang Meeting" },
  { id: 2, value: "Gedung & Aula", label: "Gedung & Aula" },
  { id: 3, value: "Pesta & Gathering", label: "Pesta & Gathering" },
  { id: 4, value: "Kafe & Restoran", label: "Kafe & Restoran" },
  { id: 5, value: "Studio & Kreatif", label: "Studio & Kreatif" },
];

const sortOptions = [
  { value: "nama_asc", label: "Nama A-Z" },
  { value: "harga_rendah", label: "Harga Termurah" },
  { value: "harga_tinggi", label: "Harga Termahal" },
  { value: "kapasitas_desc", label: "Kapasitas Terbesar" },
  { value: "terbaru", label: "Terbaru" },
];

const sewaTypeOptions = [
  { value: "perhari", label: "Per Hari" },
  { value: "perjam", label: "Per Jam" },
];

const fetcher: Fetcher<ApiResponse> = (url: string) =>
  fetch(url).then((res) => res.json());

const ITEMS_PER_PAGE = 6;

// --- Komponen Utama ---

const TempatFilterSection = () => {
  const { data } = useSWR<ApiResponse>(`/api/public-vanue`, fetcher);
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategoryParam = searchParams.get("kategori");
  const initialCategories = useMemo(() => {
    return initialCategoryParam
      ? [decodeURIComponent(initialCategoryParam)]
      : [];
  }, [initialCategoryParam]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("nama_asc");
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(initialCategories);
  const [selectedSewaTypes, setSelectedSewaTypes] = useState<string[]>([]);

  const [priceMinInput, setPriceMinInput] = useState("");
  const [priceMaxInput, setPriceMaxInput] = useState("");
  const [capacityMaxInput, setCapacityMaxInput] = useState("");
  const [localSearchInput, setLocalSearchInput] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    minPrice: 0,
    maxPrice: Infinity,
    maxCapacity: Infinity,
    localSearchQuery: "",
  });

  useEffect(() => {
    const categoryParam = searchParams.get("kategori");
    const decodedCategory = categoryParam
      ? decodeURIComponent(categoryParam)
      : null;

    if (decodedCategory && selectedCategories.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCategories([decodedCategory]);
      setCurrentPage(1);
    }
  }, [searchParams, selectedCategories.length]);

  const handleCategoryChange = (categoryValue: string, isChecked: boolean) => {
    setCurrentPage(1);
    setSelectedCategories((prev) => {
      if (isChecked) {
        return [...prev, categoryValue];
      } else {
        return prev.filter((c) => c !== categoryValue);
      }
    });
  };

  const handleSewaTypeChange = (sewaType: string, isChecked: boolean) => {
    setCurrentPage(1);
    setSelectedSewaTypes((prev) => {
      if (isChecked) {
        return [...prev, sewaType];
      } else {
        return prev.filter((t) => t !== sewaType);
      }
    });
  };

  const handleApplyFilter = () => {
    setCurrentPage(1);
    setAppliedFilters({
      minPrice: priceMinInput ? parseFloat(priceMinInput) : 0,
      maxPrice: priceMaxInput ? parseFloat(priceMaxInput) : Infinity,
      maxCapacity: capacityMaxInput ? parseFloat(capacityMaxInput) : Infinity,
      localSearchQuery: localSearchInput.trim().toLowerCase(),
    });
    if (isFilterOpen) {
      setIsFilterOpen(false);
    }
  };

  const handleResetFilter = () => {
    setCurrentPage(1);
    setSelectedCategories([]);
    setSelectedSewaTypes([]);
    setPriceMinInput("");
    setPriceMaxInput("");
    setCapacityMaxInput("");
    setLocalSearchInput("");
    setAppliedFilters({
      minPrice: 0,
      maxPrice: Infinity,
      maxCapacity: Infinity,
      localSearchQuery: "",
    });
    if (isFilterOpen) {
      setIsFilterOpen(false);
    }
  };

  const handleResetCategories = () => {
    setCurrentPage(1);
    setSelectedCategories([]);
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete("kategori");
    router.push(`?${currentParams.toString()}#tempat`, { scroll: false });
  };

  const getEffectivePrice = (venue: Venue) => {
    let price = 0;
    if (venue.harga_per_hari) {
      price = parseFloat(venue.harga_per_hari);
    } else if (venue.harga_per_jam) {
      price = parseFloat(venue.harga_per_jam);
    }
    return isNaN(price) ? 0 : price;
  };

  const allProcessedVenues = useMemo<Venue[]>(() => {
    if (!data?.data || !Array.isArray(data.data)) return [];

    let currentList: Venue[] = [...data.data];

    const localQuery = appliedFilters.localSearchQuery;

    if (localQuery) {
      currentList = currentList.filter((venue: Venue) => {
        const name = (venue.nama_ruangan || "").toLowerCase();
        return name.includes(localQuery);
      });
    }

    if (selectedCategories.length > 0) {
      currentList = currentList.filter((venue: Venue) => {
        return venue.venueCategories.some((catObj) =>
          selectedCategories.includes(catObj.category.nama_kategori)
        );
      });
    }

    if (selectedSewaTypes.length > 0) {
      currentList = currentList.filter((venue: Venue) => {
        return venue.tipe_sewa && selectedSewaTypes.includes(venue.tipe_sewa);
      });
    }

    currentList = currentList.filter((venue: Venue) => {
      const price = getEffectivePrice(venue);
      const capacity = venue.kapasitas_maks || 0;

      const priceOk =
        price >= appliedFilters.minPrice && price <= appliedFilters.maxPrice;
      const capacityOk = capacity <= appliedFilters.maxCapacity;

      return priceOk && capacityOk;
    });

    const venues = currentList;

    switch (sortBy) {
      case "harga_rendah":
        venues.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
        break;
      case "harga_tinggi":
        venues.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
        break;
      case "nama_asc":
        venues.sort((a: Venue, b: Venue) => {
          const nameA = (a.nama_ruangan || "").toUpperCase();
          const nameB = (b.nama_ruangan || "").toUpperCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        });
        break;
      case "kapasitas_desc":
        venues.sort(
          (a: Venue, b: Venue) =>
            (b.kapasitas_maks || 0) - (a.kapasitas_maks || 0)
        );
        break;
      case "terbaru":
        venues.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }

    return venues;
  }, [data, sortBy, selectedCategories, appliedFilters, selectedSewaTypes]);

  const totalItems = allProcessedVenues.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const sortedVenues = allProcessedVenues.slice(startIndex, endIndex);

  return (
    <div id="tempat" className="p-4 w-full md:p-10 space-y-4  mx-auto">
      {/* Header dan Sorting */}
      <div className="flex flex-col md:flex-row md:justify-between pb-4 border-gray-300 gap-4">
        <h1 className="font-bold text-xl md:text-2xl">
          Temukan Vanue sesuai kebutuhanmu
        </h1>

        <div className="flex items-center justify-between md:justify-start">
          {/* Tombol Buka Filter - Hanya di Mobile */}
          <Button
            variant="outline"
            className="md:hidden flex items-center gap-2"
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter className="h-5 w-5" />
            Filter
          </Button>

          {/* Selector Sorting */}
          <div className="flex h-full items-center md:ml-4">
            <Filter className="h-5 w-5 mr-2 text-gray-400 hidden md:block" />
            <Select defaultValue={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Urutkan Berdasarkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Konten Utama: Filter (Kiri) dan Daftar Venue (Kanan) */}
      <div className="flex flex-col md:flex-row w-full bg-white rounded-2xl border overflow-hidden ">
        {/* 1. Panel Filter (Sidebar) */}
        <div
          className={`
                fixed inset-0 z-50 bg-white/95 backdrop-blur-sm 
                md:static md:w-1/4 md:border-r 
                transition-transform duration-300
                ${
                  isFilterOpen
                    ? "translate-x-0"
                    : "translate-x-full md:translate-x-0"
                }
                w-full h-full md:h-auto overflow-y-auto
                md:bg-white
            `}
        >
          <div className="p-4 md:p-6 md:sticky md:top-20">
            {/* Header Filter Mobile */}
            <div className="flex justify-between items-center mb-4 md:hidden">
              <h2 className="text-xl font-bold">Filter Pencarian</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFilterOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <h2 className="text-lg font-bold mb-4 hidden md:block">Filter</h2>

            <Accordion
              type="multiple"
              defaultValue={["pencarian", "kategori", "harga", "kapasitas"]}
              className="w-full"
            >
              {/* Pencarian Nama */}
              <AccordionItem value="pencarian" className="border-b pb-5">
                <AccordionTrigger className="font-medium hover:no-underline">
                  Pencarian Nama
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2">
                  <Input
                    type="text"
                    placeholder="Cari nama venue..."
                    value={localSearchInput}
                    onChange={(e) => setLocalSearchInput(e.target.value)}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Kategori */}
              <AccordionItem value="kategori" className="border-b pb-5">
                <AccordionTrigger className="font-medium hover:no-underline">
                  Kategori
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2 space-y-3">
                  {categoryFiltersTab.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`category-${option.value}`}
                        checked={selectedCategories.includes(option.value)}
                        onCheckedChange={(isChecked: boolean) =>
                          handleCategoryChange(option.value, isChecked)
                        }
                      />
                      <label
                        htmlFor={`category-${option.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                  <div className="w-full flex justify-end items-end ">
                    <Button
                      onClick={handleResetCategories}
                      variant="link"
                      className="p-0 h-auto"
                    >
                      <span className="text-sm font-medium leading-none w-full justify-end">
                        Reset Kategori
                      </span>
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Harga */}
              <AccordionItem value="harga" className="border-b pb-5">
                <AccordionTrigger className="font-medium hover:no-underline">
                  Harga (Rp)
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2 space-y-3">
                  <div className="flex space-x-2 mb-3">
                    <Input
                      type="number"
                      name="hargaMin"
                      placeholder="Harga Min"
                      min="0"
                      className="w-1/2"
                      value={priceMinInput}
                      onChange={(e) => setPriceMinInput(e.target.value)}
                    />
                    <Input
                      type="number"
                      name="hargaMaks"
                      placeholder="Harga Maks"
                      min="0"
                      className="w-1/2"
                      value={priceMaxInput}
                      onChange={(e) => setPriceMaxInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Tipe Sewa</p>
                    {sewaTypeOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`sewa-${option.value}`}
                          checked={selectedSewaTypes.includes(option.value)}
                          onCheckedChange={(isChecked: boolean) =>
                            handleSewaTypeChange(option.value, isChecked)
                          }
                        />
                        <label
                          htmlFor={`sewa-${option.value}`}
                          className="text-sm font-medium"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Kapasitas */}
              <AccordionItem value="kapasitas" className="border-b pb-5">
                <AccordionTrigger className="font-medium hover:no-underline">
                  Kapasitas Maksimal
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2">
                  <Input
                    type="number"
                    name="kapasitasMaks"
                    placeholder="Maks. Orang"
                    min="1"
                    value={capacityMaxInput}
                    onChange={(e) => setCapacityMaxInput(e.target.value)}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-6 space-y-2">
              <Button className="w-full" onClick={handleApplyFilter}>
                Terapkan Filter
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResetFilter}
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </div>

        {/* 2. Daftar Venue (Main Content) */}
        <div className="w-full md:w-3/4 p-4 md:p-8">
          <h2 className="text-lg md:text-xl font-semibold mb-10">
            Daftar Tempat Vanue ({totalItems} total)
          </h2>

          <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {sortedVenues.map((vanue) => (
              <ProductCard key={vanue.id} ruanganData={vanue} />
            ))}
            {sortedVenues.length === 0 && (
              <p className=" col-span-full text-yellow-500 text-center h-40 flex items-center justify-center border border-dashed border-yellow-500 rounded-lg p-4">
                Tidak ada venue yang cocok dengan kriteria filter. Coba ganti
                pilihan filter Anda.
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem className="hidden sm:block">
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;

                    const isNearby =
                      pageNumber >= currentPage - 2 &&
                      pageNumber <= currentPage + 2;
                    const isBoundary =
                      pageNumber === 1 || pageNumber === totalPages;

                    if (isBoundary || isNearby) {
                      return (
                        <PaginationItem key={index}>
                          <PaginationLink
                            onClick={() => setCurrentPage(index + 1)}
                            isActive={currentPage === index + 1}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    // Elipsis (hanya ditampilkan di desktop)
                    if (
                      pageNumber === currentPage - 3 ||
                      pageNumber === currentPage + 3
                    ) {
                      return (
                        <PaginationItem
                          key={`ellipsis-${index}`}
                          className="hidden sm:block"
                        >
                          <span className="px-3 py-1.5 text-gray-500">...</span>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem className="hidden sm:block">
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TempatFilterSection;
